"""SkyTech backend API tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://skytech-digital.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@skytech.uz"
ADMIN_PASS = "admin123"
USER_EMAIL = "user@test.uz"
USER_PASS = "test123"


# ===== Fixtures =====
@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_token(s):
    r = s.post(f"{API}/auth/login", json={"email": USER_EMAIL, "password": USER_PASS})
    assert r.status_code == 200, f"User login failed: {r.text}"
    return r.json()["token"]


def h(token):
    return {"Authorization": f"Bearer {token}"}


# ===== Auth =====
class TestAuth:
    def test_register_new_user(self, s):
        email = f"TEST_{uuid.uuid4().hex[:8]}@skytech.uz"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "pw123456", "full_name": "Test Reg", "phone": "+998900000000"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and data["user"]["email"] == email

    def test_register_duplicate_email(self, s):
        r = s.post(f"{API}/auth/register", json={
            "email": USER_EMAIL, "password": "x", "full_name": "Dup"
        })
        assert r.status_code == 400

    def test_login_admin(self, admin_token):
        assert admin_token and len(admin_token) > 20

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": "nope@x.uz", "password": "wrong"})
        assert r.status_code == 401

    def test_me_endpoint(self, s, user_token):
        r = s.get(f"{API}/auth/me", headers=h(user_token))
        assert r.status_code == 200
        assert r.json()["email"] == USER_EMAIL

    def test_me_no_token(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_me_returns_picture_and_provider_fields(self, user_token):
        # User model now must include picture (optional) and auth_provider
        r = requests.get(f"{API}/auth/me", headers=h(user_token))
        assert r.status_code == 200
        data = r.json()
        assert "auth_provider" in data
        assert data["auth_provider"] in ("email", "google")
        assert "picture" in data  # may be None for email users
        assert "is_admin" in data
        assert data["email"] == USER_EMAIL


# ===== Google OAuth endpoint contract =====
class TestGoogleOAuth:
    def test_google_session_missing_header(self):
        r = requests.post(f"{API}/auth/google/session")
        assert r.status_code == 400
        assert "X-Session-ID" in r.json().get("detail", "")

    def test_google_session_invalid_session_id(self):
        r = requests.post(
            f"{API}/auth/google/session",
            headers={"X-Session-ID": "invalid-session-id-xyz-12345"}
        )
        # Should be 401 (Emergent returns non-200) or 500 if upstream throws
        assert r.status_code in (401, 500), r.text

    def test_logout_endpoint_exists(self):
        r = requests.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json().get("success") is True

    def test_cookie_based_auth_for_me(self):
        """Inject session into Mongo and verify /me works via cookie"""
        from pymongo import MongoClient
        from datetime import datetime, timezone, timedelta
        import uuid as _uuid

        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        mc = MongoClient(mongo_url)
        db = mc[db_name]

        # Create test user
        test_user_id = f"TEST_oauth_{_uuid.uuid4().hex[:8]}"
        test_email = f"TEST_oauth_{_uuid.uuid4().hex[:6]}@skytech.uz"
        session_token = f"TEST_sess_{_uuid.uuid4().hex}"
        db.users.insert_one({
            "id": test_user_id,
            "email": test_email,
            "full_name": "OAuth Test",
            "picture": "https://example.com/p.jpg",
            "auth_provider": "google",
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        db.user_sessions.insert_one({
            "user_id": test_user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        try:
            # Use cookie-based auth
            r = requests.get(f"{API}/auth/me", cookies={"session_token": session_token})
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["email"] == test_email
            assert data["auth_provider"] == "google"
            assert data["picture"] == "https://example.com/p.jpg"

            # Logout clears session
            r = requests.post(f"{API}/auth/logout", cookies={"session_token": session_token})
            assert r.status_code == 200
            remaining = db.user_sessions.find_one({"session_token": session_token})
            assert remaining is None

            # After logout, cookie no longer works
            r = requests.get(f"{API}/auth/me", cookies={"session_token": session_token})
            assert r.status_code == 401
        finally:
            db.users.delete_one({"id": test_user_id})
            db.user_sessions.delete_one({"session_token": session_token})

    def test_auth_gated_endpoint_works_with_cookie(self):
        """Verify cart endpoint accepts session_token cookie"""
        from pymongo import MongoClient
        from datetime import datetime, timezone, timedelta
        import uuid as _uuid

        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        mc = MongoClient(mongo_url)
        db = mc[db_name]

        test_user_id = f"TEST_cookie_{_uuid.uuid4().hex[:8]}"
        test_email = f"TEST_cookie_{_uuid.uuid4().hex[:6]}@skytech.uz"
        session_token = f"TEST_csess_{_uuid.uuid4().hex}"
        db.users.insert_one({
            "id": test_user_id, "email": test_email, "full_name": "Cookie Test",
            "auth_provider": "google", "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        db.user_sessions.insert_one({
            "user_id": test_user_id, "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        try:
            # Cart endpoint (auth-gated) should work with just cookie, no Bearer
            r = requests.get(f"{API}/cart", cookies={"session_token": session_token})
            assert r.status_code == 200, r.text
            assert r.json()["user_id"] == test_user_id

            # Wishlist endpoint
            r = requests.get(f"{API}/wishlist", cookies={"session_token": session_token})
            assert r.status_code == 200

            # Orders endpoint
            r = requests.get(f"{API}/orders", cookies={"session_token": session_token})
            assert r.status_code == 200
        finally:
            db.users.delete_one({"id": test_user_id})
            db.user_sessions.delete_one({"session_token": session_token})
            db.carts.delete_one({"user_id": test_user_id})
            db.wishlists.delete_one({"user_id": test_user_id})

    def test_jwt_bearer_still_works(self, user_token):
        """Backward compatibility: JWT Bearer must still work for all endpoints"""
        endpoints = ["/auth/me", "/cart", "/wishlist", "/orders"]
        for ep in endpoints:
            r = requests.get(f"{API}{ep}", headers=h(user_token))
            assert r.status_code == 200, f"{ep} failed: {r.status_code} {r.text}"


# ===== Products & Categories =====
class TestProducts:
    def test_list_products(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_filter_featured(self, s):
        r = s.get(f"{API}/products", params={"featured": "true"})
        assert r.status_code == 200
        for p in r.json():
            assert p["is_featured"] is True

    def test_filter_new(self, s):
        r = s.get(f"{API}/products", params={"new": "true"})
        assert r.status_code == 200

    def test_filter_best_seller(self, s):
        r = s.get(f"{API}/products", params={"best_seller": "true"})
        assert r.status_code == 200

    def test_filter_category(self, s):
        r = s.get(f"{API}/products", params={"category": "smartphones"})
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "smartphones"

    def test_search(self, s):
        r = s.get(f"{API}/products", params={"search": "iPhone"})
        assert r.status_code == 200

    def test_get_single_product(self, s):
        products = s.get(f"{API}/products").json()
        pid = products[0]["id"]
        r = s.get(f"{API}/products/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_get_product_404(self, s):
        r = s.get(f"{API}/products/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_categories(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        assert len(r.json()) == 6


# ===== Cart =====
class TestCart:
    def test_cart_flow(self, s, user_token):
        products = s.get(f"{API}/products").json()
        pid = products[0]["id"]
        pid2 = products[1]["id"]

        # Clear cart first
        s.delete(f"{API}/cart/clear", headers=h(user_token))

        # Add
        r = s.post(f"{API}/cart/add", json={"product_id": pid, "quantity": 2}, headers=h(user_token))
        assert r.status_code == 200, r.text

        # Get
        r = s.get(f"{API}/cart", headers=h(user_token))
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(i["product_id"] == pid and i["quantity"] == 2 for i in items)

        # Add second product
        s.post(f"{API}/cart/add", json={"product_id": pid2, "quantity": 1}, headers=h(user_token))

        # Update qty
        r = s.put(f"{API}/cart/update", json={"product_id": pid, "quantity": 5}, headers=h(user_token))
        assert r.status_code == 200
        items = s.get(f"{API}/cart", headers=h(user_token)).json()["items"]
        assert any(i["product_id"] == pid and i["quantity"] == 5 for i in items)

        # Remove
        r = s.delete(f"{API}/cart/remove/{pid2}", headers=h(user_token))
        assert r.status_code == 200
        items = s.get(f"{API}/cart", headers=h(user_token)).json()["items"]
        assert not any(i["product_id"] == pid2 for i in items)

    def test_cart_requires_auth(self, s):
        r = s.get(f"{API}/cart")
        assert r.status_code in (401, 403)

    def test_add_invalid_product(self, s, user_token):
        r = s.post(f"{API}/cart/add", json={"product_id": "bad-id", "quantity": 1}, headers=h(user_token))
        assert r.status_code == 404


# ===== Wishlist =====
class TestWishlist:
    def test_wishlist_flow(self, s, user_token):
        pid = s.get(f"{API}/products").json()[0]["id"]
        r = s.post(f"{API}/wishlist/add/{pid}", headers=h(user_token))
        assert r.status_code == 200

        r = s.get(f"{API}/wishlist", headers=h(user_token))
        assert r.status_code == 200
        assert pid in r.json()["product_ids"]

        r = s.delete(f"{API}/wishlist/remove/{pid}", headers=h(user_token))
        assert r.status_code == 200
        assert pid not in s.get(f"{API}/wishlist", headers=h(user_token)).json()["product_ids"]


# ===== Coupon =====
class TestCoupon:
    def test_valid_coupon(self, s):
        r = s.post(f"{API}/coupons/validate", params={"code": "WELCOME10", "subtotal": 2000000})
        assert r.status_code == 200
        d = r.json()
        assert d["valid"] is True
        assert d["discount_percent"] == 10

    def test_coupon_below_min(self, s):
        r = s.post(f"{API}/coupons/validate", params={"code": "WELCOME10", "subtotal": 100})
        assert r.status_code == 400

    def test_invalid_coupon(self, s):
        r = s.post(f"{API}/coupons/validate", params={"code": "FAKE", "subtotal": 2000000})
        assert r.status_code == 404


# ===== Orders =====
class TestOrders:
    def test_create_order_and_cart_cleared(self, s, user_token):
        pid = s.get(f"{API}/products").json()[0]["id"]
        s.delete(f"{API}/cart/clear", headers=h(user_token))
        s.post(f"{API}/cart/add", json={"product_id": pid, "quantity": 1}, headers=h(user_token))

        payload = {
            "shipping_address": {
                "full_name": "Test U", "phone": "+998901111111",
                "address": "Main St 1", "city": "Tashkent", "region": "Tashkent", "postal_code": "100000"
            },
            "payment_method": "cash",
            "coupon_code": None
        }
        r = s.post(f"{API}/orders", json=payload, headers=h(user_token))
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["status"] == "pending"
        assert order["total"] > 0
        order_id = order["id"]

        # Verify cart cleared
        cart = s.get(f"{API}/cart", headers=h(user_token)).json()
        assert cart["items"] == []

        # Get order
        r = s.get(f"{API}/orders/{order_id}", headers=h(user_token))
        assert r.status_code == 200

        # Get list
        r = s.get(f"{API}/orders", headers=h(user_token))
        assert r.status_code == 200
        assert any(o["id"] == order_id for o in r.json())

    def test_create_order_empty_cart(self, s, user_token):
        s.delete(f"{API}/cart/clear", headers=h(user_token))
        payload = {
            "shipping_address": {"full_name": "T", "phone": "x", "address": "x", "city": "x", "region": "x", "postal_code": "x"},
            "payment_method": "cash"
        }
        r = s.post(f"{API}/orders", json=payload, headers=h(user_token))
        assert r.status_code == 400


# ===== Chat =====
class TestChat:
    def test_send_and_get_messages(self, s, user_token):
        r = s.post(f"{API}/chat/send", json={"message": "Salom"}, headers=h(user_token))
        assert r.status_code == 200
        r = s.get(f"{API}/chat/messages", headers=h(user_token))
        assert r.status_code == 200
        msgs = r.json()
        assert len(msgs) >= 2  # user + bot reply
        assert any(m["is_support"] for m in msgs)


# ===== Reviews =====
class TestReviews:
    def test_create_review_recalcs_rating(self, s, user_token):
        pid = s.get(f"{API}/products").json()[0]["id"]
        before = s.get(f"{API}/products/{pid}").json()
        before_count = before.get("reviews_count", 0)

        r = s.post(f"{API}/reviews", json={"product_id": pid, "rating": 5, "comment": "TEST review excellent"}, headers=h(user_token))
        assert r.status_code == 200, r.text
        rv = r.json()
        assert rv["rating"] == 5
        assert rv["comment"] == "TEST review excellent"
        assert rv["product_id"] == pid
        assert rv["user_name"]

        # verify product rating updated
        prod = s.get(f"{API}/products/{pid}").json()
        assert prod["reviews_count"] == before_count + 1
        assert 1 <= prod["rating"] <= 5

    def test_get_product_reviews(self, s, user_token):
        pid = s.get(f"{API}/products").json()[0]["id"]
        # ensure at least one review
        s.post(f"{API}/reviews", json={"product_id": pid, "rating": 4, "comment": "TEST list"}, headers=h(user_token))
        r = s.get(f"{API}/reviews/product/{pid}")
        assert r.status_code == 200
        revs = r.json()
        assert isinstance(revs, list)
        assert len(revs) >= 1
        assert all(rv["product_id"] == pid for rv in revs)

    def test_review_requires_auth(self, s):
        r = s.post(f"{API}/reviews", json={"product_id": "x", "rating": 5, "comment": "x"})
        assert r.status_code in (401, 403)

    def test_review_invalid_product(self, s, user_token):
        r = s.post(f"{API}/reviews", json={"product_id": "nonexistent-xyz", "rating": 5, "comment": "x"}, headers=h(user_token))
        assert r.status_code == 404


# ===== AI Recommendations =====
class TestRecommendations:
    def test_recommendations_for_product(self, s):
        pid = s.get(f"{API}/products").json()[0]["id"]
        r = s.get(f"{API}/recommendations/{pid}", timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "recommendations" in data
        assert "reasoning" in data
        assert isinstance(data["recommendations"], list)
        # Either LLM returned items or fallback algorithm did
        # Should be 0-4 recommendations
        assert 0 <= len(data["recommendations"]) <= 4
        # If non-empty, each item should have product fields and NOT be the queried product
        for rec in data["recommendations"]:
            assert rec["id"] != pid
            assert "name_uz" in rec
            assert "price" in rec

    def test_recommendations_product_not_found(self, s):
        r = s.get(f"{API}/recommendations/nonexistent-id-xyz", timeout=30)
        assert r.status_code == 404

    def test_recommendations_returns_reasoning_string(self, s):
        pid = s.get(f"{API}/products").json()[0]["id"]
        r = s.get(f"{API}/recommendations/{pid}", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data["reasoning"], str)


# ===== Admin =====
class TestAdmin:
    def test_admin_stats(self, s, admin_token):
        r = s.get(f"{API}/admin/stats", headers=h(admin_token))
        assert r.status_code == 200
        d = r.json()
        for k in ["total_products", "total_orders", "total_customers", "total_revenue", "recent_orders"]:
            assert k in d

    def test_admin_orders(self, s, admin_token):
        r = s.get(f"{API}/admin/orders", headers=h(admin_token))
        assert r.status_code == 200

    def test_admin_customers(self, s, admin_token):
        r = s.get(f"{API}/admin/customers", headers=h(admin_token))
        assert r.status_code == 200

    def test_non_admin_forbidden(self, s, user_token):
        r = s.get(f"{API}/admin/stats", headers=h(user_token))
        assert r.status_code == 403

    def test_admin_create_and_delete_product(self, s, admin_token):
        payload = {
            "name": "TEST Product", "name_uz": "TEST Mahsulot",
            "description": "test", "description_uz": "test",
            "price": 100000, "category": "accessories",
            "image": "https://example.com/x.jpg", "stock": 5
        }
        r = s.post(f"{API}/products", json=payload, headers=h(admin_token))
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        # Delete
        r = s.delete(f"{API}/products/{pid}", headers=h(admin_token))
        assert r.status_code == 200
        r = s.get(f"{API}/products/{pid}")
        assert r.status_code == 404

    def test_admin_update_order_status(self, s, admin_token, user_token):
        # Create an order via user
        pid = s.get(f"{API}/products").json()[0]["id"]
        s.delete(f"{API}/cart/clear", headers=h(user_token))
        s.post(f"{API}/cart/add", json={"product_id": pid, "quantity": 1}, headers=h(user_token))
        order = s.post(f"{API}/orders", json={
            "shipping_address": {"full_name": "T", "phone": "+998900000000", "address": "x", "city": "Tashkent", "region": "Tashkent", "postal_code": "100000"},
            "payment_method": "cash"
        }, headers=h(user_token)).json()
        oid = order["id"]
        r = s.put(f"{API}/admin/orders/{oid}/status", params={"new_status": "processing"}, headers=h(admin_token))
        assert r.status_code == 200
        # verify
        updated = s.get(f"{API}/orders/{oid}", headers=h(admin_token)).json()
        assert updated["status"] == "processing"
