import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Wishlist from "@/pages/Wishlist";

// AppRouter handles OAuth callback detection synchronously to prevent race conditions
function AppRouter() {
  const location = useLocation();

  // CRITICAL: Detect session_id in URL fragment BEFORE rendering normal routes
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <div className="App min-h-screen bg-white dark:bg-[#0A2540] transition-colors">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Footer />
      <ChatWidget />
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRouter />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
