import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { ShoppingCart, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export const CartPage = () => {
  const { cart, loading, updatingId, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem', maxWidth: '540px', margin: '0 auto' }}>
          <ShoppingCart size={54} color="#6b7280" style={{ marginBottom: '1.25rem' }} />
          <h2>Your Shopping Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.5rem 0' }}>
            Explore our multi-vendor book catalog and find your next great read.
          </p>
          <Link to="/" className="btn btn-primary">
            <BookOpen size={18} /> Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Shopping Cart ({cart.totalItems} Items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
        {/* Cart Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item._id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '100px 1fr 140px 100px auto',
                alignItems: 'center',
                gap: '1.25rem'
              }}
            >
              <div style={{ width: '90px', height: '110px', borderRadius: '8px', overflow: 'hidden', background: '#1f2937' }}>
                <img
                  src={item.book?.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300'}
                  alt={item.book?.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.book?.title || 'Book Title'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Seller: <strong>{item.seller?.name || 'Verified Seller'}</strong>
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-info">{item.condition}</span>
                  <span className="badge badge-warning">{item.format}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  disabled={item.quantity <= 1 || updatingId === item.listingId}
                  onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                  className="btn btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  disabled={updatingId === item.listingId || item.quantity >= item.stockAvailable}
                  onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                  className="btn btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                >
                  +
                </button>
              </div>

              <div style={{ textStyle: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>
                  ₹{item.itemTotal}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>₹{item.price} each</div>
              </div>

              <button
                onClick={() => removeItem(item.listingId)}
                disabled={updatingId === item.listingId}
                className="btn btn-danger"
                style={{ padding: '0.5rem' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={clearCart} className="btn btn-secondary" style={{ color: '#ef4444' }}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Financial Summary Box */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Financial Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Item Subtotal</span>
                <span style={{ fontWeight: 700 }}>₹{cart.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Tax (5% GST)</span>
                <span>₹{Math.round(cart.subtotal * 0.05 * 100) / 100}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping Fee</span>
                <span>{cart.subtotal >= 999 ? <strong style={{ color: '#10b981' }}>FREE</strong> : '₹50'}</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>Total Payable</span>
                <span style={{ color: '#6366f1' }}>
                  ₹{Math.round((cart.subtotal + (cart.subtotal * 0.05) + (cart.subtotal >= 999 ? 0 : 50)) * 100) / 100}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
