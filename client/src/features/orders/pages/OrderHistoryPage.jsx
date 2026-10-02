import React from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { Package, Clock, ShieldCheck, BookOpen } from 'lucide-react';

export const OrderHistoryPage = () => {
  const { orders, loading, error } = useOrders();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your order acquisition archive...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-secondary)' }}>
            Collector Archive
          </span>
          <span style={{ color: 'var(--text-subtle)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Historical Order Snapshots
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--accent-primary)' }}>
          Your Acquisition History
        </h1>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', color: 'var(--danger)', background: '#fee2e2', borderColor: '#fecaca', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)' }}>
          <BookOpen size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>No acquisition records found</h3>
          <p style={{ color: 'var(--text-muted)' }}>When you complete book acquisitions, your immutable item snapshots and escrow verifications will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-surface)' }}>
              {/* Order Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Acquisition Ref</span>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {order.orderNumber}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Acquired Date</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Total Settled</span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      ₹{order.pricing?.grandTotal}
                    </div>
                  </div>
                  <span className={`badge ${order.orderStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                    <Clock size={12} /> {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Item Line Snapshots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {order.items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={item.coverImageSnapshot} alt={item.bookTitleSnapshot} style={{ width: '42px', height: '56px', borderRadius: '2px', objectFit: 'cover', boxShadow: '0 2px 6px rgba(15,23,42,0.1)' }} />
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{item.bookTitleSnapshot}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ISBN: {item.bookIsbnSnapshot} • Grade: <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{item.conditionSnapshot}</span> • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="badge badge-success">{item.itemStatus}</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--accent-secondary)' }}>₹{item.subtotal}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Verification Snapshot */}
              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>Dispatched To: <strong style={{ color: 'var(--text-main)' }}>{order.shippingAddressSnapshot?.fullName}</strong> ({order.shippingAddressSnapshot?.streetAddress}, {order.shippingAddressSnapshot?.city})</span>
                <span style={{ color: 'var(--tertiary-guild)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <ShieldCheck size={15} /> Escrow & Signature Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
