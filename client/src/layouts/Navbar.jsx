import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useCartContext } from '../features/cart/context/CartContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { BookOpen, ShoppingBag, User, Store, LogOut, ShieldCheck, ShieldAlert, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin, logout } = useAuth();
  const { totalItems } = useCartContext();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Archival Trust Ribbon */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.35rem 0',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color="var(--tertiary-guild)" />
            <span>Verified Independent Booksellers Worldwide</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--accent-secondary)' }}>✦</span>
            <span>Escrow Protection on Acquisitions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={14} color="var(--tertiary-guild)" />
            <span>Triple-Check Condition Guarantee</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)',
        padding: '0.75rem 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--accent-primary)',
              padding: '7px 9px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <BookOpen size={20} color={isDark ? '#12110f' : '#fcf9f2'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--accent-primary)'
              }}>
                Book<span style={{ color: 'var(--accent-secondary)' }}>WORM</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-subtle)',
                marginTop: '2px'
              }}>
                Archival Book Marketplace
              </span>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              Catalog
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              title={isDark ? 'Switch to Parchment (Light) Theme' : 'Switch to Midnight Scholar (Dark) Theme'}
              style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle dark/light theme"
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--accent-secondary)" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Seller-Only View */}
                {isSeller && (
                  <Link to="/seller/dashboard" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}>
                    <Store size={15} /> Seller Studio
                  </Link>
                )}

                {/* Admin View */}
                {isAdmin && (
                  <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: 'var(--tertiary-guild)' }}>
                    <ShieldAlert size={15} /> Admin
                  </Link>
                )}

                {/* Buyer-Only View: Orders & Cart */}
                {isBuyer && (
                  <>
                    <Link to="/orders" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                      <User size={15} /> Orders
                    </Link>

                    <Link
                      to="/cart"
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <ShoppingBag size={18} color="var(--accent-secondary)" />
                      <span>Cart</span>
                      {totalItems > 0 && (
                        <span style={{
                          background: 'var(--accent-secondary)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {totalItems}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="btn btn-secondary"
                  title="Log out"
                  style={{ padding: '0.45rem 0.65rem' }}
                >
                  <LogOut size={16} color="var(--text-muted)" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
