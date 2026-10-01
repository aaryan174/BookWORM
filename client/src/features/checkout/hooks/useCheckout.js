import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../../orders/api/order.api.js';
import { userApi } from '../../profile/api/user.api.js';
import { paymentApi } from '../api/payment.api.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { useCartContext } from '../../cart/context/CartContext.jsx';

export const useCheckout = () => {
  const { addToast } = useToast();
  const { clearCart } = useCartContext();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getAddresses();
      if (res.success && res.data.addresses) {
        setAddresses(res.data.addresses);
        const defaultAddr = res.data.addresses.find(a => a.isDefault) || res.data.addresses[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const fetchSummary = useCallback(async (addressId) => {
    if (!addressId) return;
    try {
      setError(null);
      const res = await orderApi.getCheckoutSummary({ addressId });
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      fetchSummary(selectedAddressId);
    }
  }, [selectedAddressId, fetchSummary]);

  const processPaymentCheckout = async () => {
    if (!selectedAddressId) {
      addToast('Please select a shipping delivery address', 'error');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Create Order
      const orderRes = await orderApi.createOrder({ addressId: selectedAddressId });
      const order = orderRes.data.order;

      // Step 2: Initialize Payment
      const payRes = await paymentApi.createPaymentOrder({ orderId: order._id });
      const paymentOrder = payRes.data;

      // Step 3: Verify Payment (Simulated for instant verification in development/test key mode)
      const verifyRes = await paymentApi.verifyPayment({
        orderId: order._id,
        razorpayOrderId: paymentOrder.razorpayOrderId,
        razorpayPaymentId: `pay_simulated_${Date.now()}`,
        razorpaySignature: 'simulated_valid_signature'
      });

      addToast('Payment verified & order confirmed successfully!', 'success');
      await clearCart();
      return verifyRes.data.order;
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    summary,
    loading,
    submitting,
    error,
    refreshAddresses: fetchAddresses,
    processPaymentCheckout
  };
};
