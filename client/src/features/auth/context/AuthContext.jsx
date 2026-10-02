import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bookworm_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('bookworm_user', JSON.stringify(res.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('bookworm_user');
        localStorage.removeItem('bookworm_token');
      }
    } catch {
      // If server explicitly responds with 401/403, clear cached user
      setUser(null);
      localStorage.removeItem('bookworm_user');
      localStorage.removeItem('bookworm_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data.user) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('bookworm_token', res.data.token);
      }
      localStorage.setItem('bookworm_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success && res.data.user) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('bookworm_token', res.data.token);
      }
      localStorage.setItem('bookworm_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('bookworm_token');
      localStorage.removeItem('bookworm_user');
    }
  };

  const isSeller = Boolean(user?.roles?.includes('seller'));
  const isBuyer = Boolean(user?.roles?.includes('buyer'));
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const isSellerOnly = isSeller && !isBuyer;
  const isBuyerOnly = isBuyer && !isSeller;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isSeller,
        isBuyer,
        isAdmin,
        isSellerOnly,
        isBuyerOnly,
        login,
        register,
        logout,
        refreshSession: fetchSession,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
