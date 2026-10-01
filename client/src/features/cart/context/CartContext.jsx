import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api.js';
import { useAuthContext } from '../../auth/context/AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (listingId, quantity = 1) => {
    const res = await cartApi.addItem({ listingId, quantity });
    if (res.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res;
  };

  const updateQuantity = async (listingId, quantity) => {
    const res = await cartApi.updateQuantity(listingId, { quantity });
    if (res.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res;
  };

  const removeItem = async (listingId) => {
    const res = await cartApi.removeItem(listingId);
    if (res.success && res.data.cart) {
      setCart(res.data.cart);
    }
    return res;
  };

  const clearCart = async () => {
    const res = await cartApi.clearCart();
    setCart({ items: [], subtotal: 0, totalItems: 0 });
    return res;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems: cart.totalItems || 0,
        subtotal: cart.subtotal || 0,
        fetchCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within CartProvider');
  return context;
};
