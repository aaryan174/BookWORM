import { useState } from 'react';
import { useCartContext } from '../context/CartContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';

export const useCart = () => {
  const cartContext = useCartContext();
  const { addToast } = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const handleAddToCart = async (listingId, quantity = 1) => {
    try {
      setUpdatingId(listingId);
      const res = await cartContext.addItem(listingId, quantity);
      addToast('Item added to cart!', 'success');
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateQuantity = async (listingId, quantity) => {
    try {
      setUpdatingId(listingId);
      const res = await cartContext.updateQuantity(listingId, quantity);
      addToast('Cart updated', 'info');
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (listingId) => {
    try {
      setUpdatingId(listingId);
      const res = await cartContext.removeItem(listingId);
      addToast('Item removed from cart', 'info');
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    ...cartContext,
    updatingId,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem
  };
};
