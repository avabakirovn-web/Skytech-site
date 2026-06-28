# SkyTech E-commerce Platform PRD

## Original Problem Statement
Premium, modern e-commerce website for SkyTech (electronics & gadgets store) in Uzbek language.
- Brand colors: White, Dark Blue (#0A2540), Sky Blue (#3B82F6), Light Gray (#F5F7FA)
- Style: Apple + Samsung + Amazon inspired, minimalistic, premium
- Contact: +998 94 884 64 46, @skytech_shop, instagram.com/skytech_uz

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn UI, Lucide Icons
- Backend: FastAPI, MongoDB, JWT auth, bcrypt
- Styling: Poppins (headings) + Inter (body)

## User Personas
1. **Customer**: Browses, adds to cart/wishlist, places orders, leaves reviews
2. **Admin**: Manages products, views statistics, processes orders

## Core Requirements (Static)
- All UI in Uzbek language
- Premium glassmorphism design with sky blue accent
- Multi-step checkout (shipping → payment → confirmation)
- Live chat support widget
- Dark/Light mode toggle
- Mobile responsive

## What's Been Implemented (Phase 1) - Feb 2026
### Backend (FastAPI + MongoDB)
- Authentication (JWT, bcrypt) - register, login, /me
- Products CRUD with category, search, featured/new/best_seller filters
- Categories (6 categories seeded)
- Cart management (add, update, remove, clear)
- Wishlist (add, remove, list)
- Orders (create, list, get by id)
- Reviews with auto-rating calculation
- Coupons validation (WELCOME10, SALE20)
- Chat messages (user + auto-reply)
- Admin endpoints (stats, all orders, customers, status updates)

### Frontend (React)
- Home page (hero, categories, featured/new/best-seller sections)
- Auth page (login/register tabs)
- Products listing with category filter sidebar
- Product detail with image gallery, specs, reviews, related products
- Cart with quantity controls
- Multi-step Checkout (shipping/payment/confirmation/success)
- User Dashboard (orders, wishlist, profile, addresses, notifications)
- Admin Dashboard (overview stats, orders mgmt, products CRUD, customers)
- Wishlist page
- Chat Widget (bottom-right floating)
- Navbar with search, cart counter, theme toggle, user menu
- Footer with social links (Instagram, Telegram), contact info

### Test Credentials
- Admin: admin@skytech.uz / admin123
- User: user@test.uz / test123
- Coupons: WELCOME10 (10% off 1M+), SALE20 (20% off 5M+)

## P0/P1/P2 Backlog
### P1 (Next iteration)
- Product reviews UI on detail page (submit form)
- Real payment integration (Stripe/Click/Payme)
- Order tracking timeline
- Email notifications for orders
- Manage addresses CRUD

### P2 (Future)
- AI Product Recommendations (LLM-based)
- Multi-language (RU, EN)
- Multi-currency (UZS, USD)
- Product comparison
- Recently viewed
- Advanced filtering (price range, brand, rating)
- Newsletter actual subscription
- SEO meta tags per page

## Architecture
```
/app/
├── backend/
│   ├── server.py        # All API endpoints
│   ├── seed.py          # Database seeding
│   └── .env
├── frontend/
│   └── src/
│       ├── App.js
│       ├── context/     # Auth, Cart, Theme
│       ├── components/  # Navbar, Footer, ProductCard, ChatWidget
│       └── pages/       # Home, Auth, Products, ProductDetail, Cart, Checkout, UserDashboard, AdminDashboard, Wishlist
└── memory/
    ├── PRD.md
    └── test_credentials.md
```
