import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { userApi } from '../../profile/api/user.api.js';
import { ShieldCheck, MapPin, CreditCard, Plus, CheckCircle2 } from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    summary,
    loading,
    submitting,
    error,
    refreshAddresses,
    processPaymentCheckout
  } = useCheckout();

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    country: 'India'
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userApi.addAddress(newAddr);
      addToast('New delivery address saved!', 'success');
      setShowAddAddr(false);
      setNewAddr({ fullName: '', streetAddress: '', city: '', state: '', postalCode: '', phone: '', country: 'India' });
      await refreshAddresses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const order = await processPaymentCheckout();
      if (order) {
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Secure Checkout</h1>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: '#ef4444', color: '#f87171' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        <div>
          {/* Address Selection */}
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin color="#6366f1" size={22} /> 1. Select Delivery Address
              </h2>
              <button onClick={() => setShowAddAddr(!showAddAddr)} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Address
              </button>
            </div>

            {showAddAddr && (
              <form onSubmit={handleAddAddress} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>New Address Form</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-input" required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input type="text" className="form-input" required value={newAddr.streetAddress} onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="form-input" required value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-input" required value={newAddr.postalCode} onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Save Address</button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No delivery addresses saved. Please add an address to continue.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: `1px solid ${selectedAddressId === addr._id ? '#6366f1' : 'var(--border-color)'}`,
                      background: selectedAddressId === addr._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      style={{ marginTop: '4px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{addr.fullName}</strong> ({addr.phone})
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Badge */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CreditCard color="#10b981" size={22} /> 2. Payment Method
            </h2>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="#10b981" size={22} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>Razorpay Payment Gateway (Cards / UPI / Netbanking)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified HMAC signature verification & idempotent order confirmation</p>
                </div>
              </div>
              <span className="badge badge-success"><ShieldCheck size={12} /> 256-Bit SSL</span>
            </div>
          </div>
        </div>

        {/* Order Review Box */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Review
            </h3>

            {summary && summary.pricing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                  <span>₹{summary.pricing.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST Tax (5%)</span>
                  <span>₹{summary.pricing.taxAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping Fee</span>
                  <span>{summary.pricing.shippingFee === 0 ? <strong style={{ color: '#10b981' }}>FREE</strong> : `₹${summary.pricing.shippingFee}`}</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                  <span>Grand Total</span>
                  <span style={{ color: '#10b981' }}>₹{summary.pricing.grandTotal}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              disabled={submitting || !selectedAddressId}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {submitting ? 'Processing Payment...' : `Pay & Place Order`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
