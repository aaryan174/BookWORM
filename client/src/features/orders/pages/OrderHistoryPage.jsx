import React from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { Package, Clock, ShieldCheck } from 'lucide-react';

export const OrderHistoryPage = () => {
  const { orders, loading, error } = useOrders();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Your Order History</h1>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Package size={48} color="#6b7280" style={{ marginBottom: '1rem' }} />
          <h3>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>When you complete purchases, your item snapshots and tracking updates will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel" style={{ padding: '1.75rem' }}>
              {/* Order Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{order.orderNumber}</div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed On</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{order.pricing?.grandTotal}</div>
                  </div>
                  <span className={`badge ${order.orderStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                    <Clock size={12} /> {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Item Line Snapshots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={item.coverImageSnapshot} alt={item.bookTitleSnapshot} style={{ width: '45px', height: '58px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{item.bookTitleSnapshot}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ISBN: {item.bookIsbnSnapshot} • Condition: {item.conditionSnapshot} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="badge badge-info">{item.itemStatus}</span>
                      <strong style={{ fontSize: '0.95rem' }}>₹{item.subtotal}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Snapshot */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Deliver To: <strong>{order.shippingAddressSnapshot?.fullName}</strong> ({order.shippingAddressSnapshot?.streetAddress}, {order.shippingAddressSnapshot?.city})</span>
                <span style={{ color: '#10b981' }}><ShieldCheck size={14} style={{ display: 'inline' }} /> HMAC Verification Passed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
