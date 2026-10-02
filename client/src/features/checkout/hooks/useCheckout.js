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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

      // Step 2: Initialize Payment Order on Gateway
      const payRes = await paymentApi.createPaymentOrder({ orderId: order._id });
      const paymentOrder = payRes.data;

      // Step 3: Check if real Razorpay keys are active or mock mode
      const isMockMode = !paymentOrder.keyId || paymentOrder.keyId.startsWith('rzp_test_bookworm');

      if (!isMockMode) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && window.Razorpay) {
          return new Promise((resolve, reject) => {
            const options = {
              key: paymentOrder.keyId,
              amount: paymentOrder.amountInPaise,
              currency: paymentOrder.currency || 'INR',
              name: 'BookWORM Marketplace',
              description: `Order #${paymentOrder.orderNumber}`,
              order_id: paymentOrder.razorpayOrderId,
              handler: async (response) => {
                try {
                  const verifyRes = await paymentApi.verifyPayment({
                    orderId: order._id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature
                  });

                  addToast('Payment verified & order confirmed successfully!', 'success');
                  await clearCart();
                  setSubmitting(false);
                  resolve(verifyRes.data.order);
                } catch (verifyErr) {
                  setError(verifyErr.message);
                  addToast(verifyErr.message || 'Payment signature verification failed', 'error');
                  try {
                    await orderApi.cancelPendingOrder(order._id);
                    await fetchSummary(selectedAddressId);
                  } catch (_) {}
                  setSubmitting(false);
                  reject(verifyErr);
                }
              },
              modal: {
                ondismiss: async () => {
                  setSubmitting(false);
                  addToast('Payment cancelled. Your items remain saved in your cart.', 'info');
                  try {
                    await orderApi.cancelPendingOrder(order._id);
                    await fetchSummary(selectedAddressId);
                  } catch (_) {}
                }
              },
              theme: {
                color: '#4f46e5'
              }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', async (failRes) => {
              setSubmitting(false);
              const errMsg = failRes.error?.description || 'Payment failed at gateway';
              addToast(`${errMsg}. Your items remain saved in your cart.`, 'error');
              try {
                await orderApi.cancelPendingOrder(order._id);
                await fetchSummary(selectedAddressId);
              } catch (_) {}
              reject(new Error(errMsg));
            });
            rzp.open();
          });
        }
      }

      // Step 4: Fallback for Mock environment or when Razorpay script isn't needed
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
