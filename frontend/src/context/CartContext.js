import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetchCart();
    }
  }, [token, user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Savatchani yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        `${API}/cart/add`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
      return true;
    } catch (error) {
      console.error('Mahsulotni savatchaga qo\'shishda xato:', error);
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await axios.put(
        `${API}/cart/update`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Savatchani yangilashda xato:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Mahsulotni o\'chirishda xato:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart({ items: [] });
    } catch (error) {
      console.error('Savatchani tozalashda xato:', error);
    }
  };

  const getCartCount = () => {
    return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartCount,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};