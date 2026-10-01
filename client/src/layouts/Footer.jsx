import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      marginTop: '4rem',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 2rem 0',
      background: 'rgba(11, 15, 25, 0.8)',
      color: 'var(--text-muted)',
      fontSize: '0.9rem'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', padding: '6px', borderRadius: '8px' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              Book<span style={{ color: '#6366f1' }}>WORM</span>
            </span>
          </div>
          <p style={{ lineHeight: 1.6 }}>
            The production-grade online marketplace connecting readers, independent sellers, and bookshops worldwide.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.8rem' }}>Marketplace</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/" style={{ color: 'inherit' }}>Browse Books</a></li>
            <li><a href="/seller/onboard" style={{ color: 'inherit' }}>Become a Seller</a></li>
            <li><a href="/orders" style={{ color: 'inherit' }}>Track Orders</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.8rem' }}>Security & Payment</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            256-bit SSL Encryption • Server-side HMAC Payment Verification • Razorpay Integration • Idempotent Processing
          </p>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
        © 2026 BookWORM Marketplace Inc. All rights reserved. Architected for client delivery.
      </div>
    </footer>
  );
};
