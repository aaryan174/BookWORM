import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
    }
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success && res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const isSeller = user?.roles?.includes('seller');
  const isAdmin = user?.roles?.includes('admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isSeller,
        isAdmin,
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
