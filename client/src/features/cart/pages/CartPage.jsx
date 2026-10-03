import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { ShoppingBag, Trash2, ArrowRight, BookOpen, ShieldCheck, Store } from 'lucide-react';
import { useAuthContext } from '../../auth/context/AuthContext.jsx';

const getConditionBadgeClass = (condition) => {
  switch (condition?.toUpperCase()) {
    case 'NEW': return 'badge-new';
    case 'LIKE_NEW':
    case 'LIKE NEW': return 'badge-likenew';
    case 'GOOD': return 'badge-good';
    case 'FAIR': return 'badge-fair';
    default: return 'badge-info';
  }
};

export const CartPage = () => {
  const { cart, loading, updatingId, updateQuantity, removeItem, clearCart } = useCart();
  const { isSeller, isBuyer } = useAuthContext();
  const navigate = useNavigate();

  if (isSeller && !isBuyer) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '580px', margin: '0 auto', background: 'var(--bg-surface)' }}>
          <Store size={52} color="var(--accent-secondary)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
            Bookseller Account Active
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.75rem 0', lineHeight: 1.6 }}>
            In BookWORM's marketplace, Seller accounts manage inventory and publish titles, but cannot make purchases or checkout orders. To acquire books, please sign in with a Buyer account.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/seller/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Store size={17} /> Go to Seller Studio
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              <BookOpen size={17} /> Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Calculating bookbag pricing & tax totals...</p>
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '560px', margin: '0 auto', background: 'var(--bg-surface)' }}>
          <ShoppingBag size={52} color="var(--accent-secondary)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Your Acquisition Bag is Empty</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.75rem 0' }}>
            Discover authenticated copies, vintage editions, and trade publications across certified independent booksellers.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <BookOpen size={17} /> Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-secondary)' }}>
            Acquisition Ledger
          </span>
          <span style={{ color: 'var(--text-subtle)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {cart.totalItems} Volume{cart.totalItems === 1 ? '' : 's'} Selected
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--accent-primary)' }}>
          Review Your Selected Volumes
        </h1>
      </div>

      <div className="responsive-two-col" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Cart Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <div
              key={item._id}
              className="glass-panel cart-item-card"
              style={{
                background: 'var(--bg-surface)'
              }}
            >
              {/* Recessed Cover Mat */}
              <div style={{
                width: '80px',
                height: '105px',
                borderRadius: 'var(--radius-sm)',
                background: '#ede8de',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <img
                  src={item.book?.coverImageUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300'}
                  alt={item.book?.title}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Title & Seller Provenance */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  marginBottom: '0.25rem',
                  color: 'var(--text-main)'
                }}>
                  {item.book?.title || 'Book Title'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                  Bookseller: <strong style={{ color: 'var(--text-main)' }}>{item.seller?.name || 'Verified Bookseller'}</strong>
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getConditionBadgeClass(item.condition)}`}>
                    {item.condition?.replace('_', ' ')}
                  </span>
                  <span className="badge badge-info">{item.format}</span>
                </div>
              </div>

              {/* Item Actions & Price Meta Container */}
              <div className="cart-item-meta">
                {/* Quantity Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    disabled={item.quantity <= 1 || updatingId === item.listingId}
                    onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                    className="btn btn-secondary"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, width: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    disabled={updatingId === item.listingId || item.quantity >= item.stockAvailable}
                    onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                    className="btn btn-secondary"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    +
                  </button>
                </div>

                {/* Price Calculation */}
                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--accent-secondary)'
                  }}>
                    ₹{item.itemTotal}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>₹{item.price} each</div>
                </div>

                {/* Remove Action */}
                <button
                  onClick={() => removeItem(item.listingId)}
                  disabled={updatingId === item.listingId}
                  className="btn btn-secondary"
                  title="Remove volume"
                  style={{ padding: '0.45rem', borderColor: 'transparent', color: 'var(--danger)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={clearCart} className="btn btn-secondary" style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Financial Summary Box */}
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
              Order Financial Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Volumes Subtotal</span>
                <span style={{ fontWeight: 700 }}>₹{cart.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Tax (5% GST)</span>
                <span>₹{Math.round(cart.subtotal * 0.05 * 100) / 100}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Archival Delivery</span>
                <span>{cart.subtotal >= 999 ? <strong style={{ color: 'var(--tertiary-guild)' }}>FREE</strong> : '₹50'}</span>
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
                <span>Total Payable</span>
                <span style={{ color: 'var(--accent-secondary)' }}>
                  ₹{Math.round((cart.subtotal + (cart.subtotal * 0.05) + (cart.subtotal >= 999 ? 0 : 50)) * 100) / 100}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)'
            }}>
              <ShieldCheck size={14} color="var(--tertiary-guild)" />
              <span>Escrow protection enabled on this order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
