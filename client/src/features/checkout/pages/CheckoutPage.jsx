import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { userApi } from '../../profile/api/user.api.js';
import { useCartContext } from '../../cart/context/CartContext.jsx';
import { ShieldCheck, MapPin, CreditCard, Plus, CheckCircle2, ShoppingBag, BookOpen } from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { cart } = useCartContext();
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Preparing secure checkout & escrow verification...</p>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '540px', margin: '0 auto', background: 'var(--bg-surface)' }}>
          <ShoppingBag size={52} color="var(--accent-secondary)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
            Your Bookbag is Empty
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.75rem 0', lineHeight: 1.6 }}>
            You do not have any items in your cart to checkout. Browse our catalog to select your favorite books.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <BookOpen size={17} /> Explore Marketplace Catalog
          </Link>
        </div>
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
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-secondary)' }}>
            Secure Checkout
          </span>
          <span style={{ color: 'var(--text-subtle)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Escrow Protected Acquisition
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--accent-primary)' }}>
          Delivery & Payment Confirmation
        </h1>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: '#fecaca', color: 'var(--danger)', background: '#fee2e2' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
        <div>
          {/* Address Selection */}
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <MapPin color="var(--accent-secondary)" size={20} /> 1. Select Delivery Destination
              </h2>
              <button onClick={() => setShowAddAddr(!showAddAddr)} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                <Plus size={15} /> Add New Address
              </button>
            </div>

            {showAddAddr && (
              <form onSubmit={handleAddAddress} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>New Delivery Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Recipient Name</label>
                    <input type="text" className="form-input" required value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone Number</label>
                    <input type="text" className="form-input" required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address & Landmark</label>
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
                <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.35rem' }}>Save & Use Address</button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No delivery destinations recorded. Please add an address to continue.</p>
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
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${selectedAddressId === addr._id ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                      background: selectedAddressId === addr._id ? 'var(--bg-surface-high)' : 'transparent',
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
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{addr.fullName}</strong> ({addr.phone})
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
          <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
              <CreditCard color="var(--tertiary-guild)" size={20} /> 2. Payment Gateway & Escrow
            </h2>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="var(--tertiary-guild)" size={22} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Razorpay Payment Gateway (Cards / UPI / Netbanking)</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified HMAC signature verification & idempotent order confirmation</p>
                </div>
              </div>
              <span className="badge badge-success"><ShieldCheck size={12} /> 256-Bit Escrow</span>
            </div>
          </div>
        </div>

        {/* Order Review Box */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '100px', background: 'var(--bg-surface)' }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem',
              color: 'var(--accent-primary)'
            }}>
              Acquisition Summary
            </h3>

            {summary && summary.pricing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                  <span>₹{summary.pricing.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST Tax (5%)</span>
                  <span>₹{summary.pricing.taxAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Archival Delivery</span>
                  <span>{summary.pricing.shippingFee === 0 ? <strong style={{ color: 'var(--tertiary-guild)' }}>FREE</strong> : `₹${summary.pricing.shippingFee}`}</span>
                </div>
                <div style={{
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)'
                }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>₹{summary.pricing.grandTotal}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              disabled={submitting || !selectedAddressId}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {submitting ? 'Verifying with Gateway...' : `Authorize & Pay ₹${summary?.pricing?.grandTotal || ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
