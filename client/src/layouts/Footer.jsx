import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Award, Lock, Store } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      marginTop: '5rem',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      padding: '3.5rem 0 2rem 0'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
        {/* Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.2), 0 0 0 1px rgba(180, 83, 9, 0.3)',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img
                src="/logo-round-sm.png"
                alt="BookWORM Logo"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--accent-primary)'
            }}>
              Book<span style={{ color: 'var(--accent-secondary)' }}>WORM</span>
            </span>
          </div>
          <p style={{ lineHeight: 1.6, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            The production-grade online marketplace connecting discerning readers, certified independent booksellers, and archival antiquarians worldwide.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '1rem',
            fontSize: '0.78rem',
            color: 'var(--tertiary-guild)',
            fontWeight: 600
          }}>
            <ShieldCheck size={16} />
            <span>Certified Bookseller Guild Standards</span>
          </div>
        </div>

        {/* Marketplace Links */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)', marginBottom: '0.85rem', fontSize: '1rem' }}>
            Curated Discovery
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Browse Catalog</Link></li>
            <li><Link to="/seller/onboard" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Start Selling as an Indie Bookseller</Link></li>
            <li><Link to="/orders" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Acquisition Order History</Link></li>
            <li><Link to="/cart" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>View Shopping Bag</Link></li>
          </ul>
        </div>

        {/* Seller Studio Operations */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)', marginBottom: '0.85rem', fontSize: '1rem' }}>
            Bookseller Hub
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
            <li><Link to="/seller/dashboard" style={{ color: 'var(--text-muted)' }}>Seller Studio Dashboard</Link></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Condition Grade Guidelines</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Escrow Payouts & Settlement</span></li>
            <li><span style={{ color: 'var(--text-muted)' }}>Canonical ISBN Matching</span></li>
          </ul>
        </div>

        {/* Security & Provenance */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)', marginBottom: '0.85rem', fontSize: '1rem' }}>
            Integrity & Security
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Every acquisition is secured with 256-bit SSL encryption, server-side Razorpay HMAC signature verification, and transparent seller escrow protection.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success"><Lock size={11} /> SSL 256-Bit</span>
            <span className="badge badge-info"><Award size={11} /> Escrow Guard</span>
            <span className="badge badge-warning"><Store size={11} /> Verified Merchant</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        marginTop: '2.5rem',
        paddingTop: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-subtle)'
      }}>
        <div>
          © 2026 BookWORM Marketplace Platform Inc. Designed under the Stitch Literary Provenance specification.
        </div>
        <div>
          Architected for high-reliability marketplace client delivery.
        </div>
      </div>
    </footer>
  );
};
