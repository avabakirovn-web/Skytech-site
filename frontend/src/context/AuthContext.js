import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await axios.get(`${API}/auth/me`, {
        headers,
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      // Not authenticated - clear any stale token
      if (token) {
        localStorage.removeItem('token');
        setToken(null);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (email, password, full_name, phone) => {
    const response = await axios.post(`${API}/auth/register`, {
      email,
      password,
      full_name,
      phone
    });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const setGoogleUser = (googleUser) => {
    setUser(googleUser);
    // Clear JWT token since we're now using session cookie
    localStorage.removeItem('token');
    setToken(null);
  };

  const logout = async () => {
    try {
      // Try to clear server-side session
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // Ignore errors
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Redirect to home after logout
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, setGoogleUser, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
