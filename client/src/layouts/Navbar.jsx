import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useCartContext } from '../features/cart/context/CartContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { BookOpen, ShoppingBag, User, Store, LogOut, ShieldAlert, Sun, Moon, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin, logout } = useAuth();
  const { totalItems } = useCartContext();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever location/route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Main Navbar */}
      <nav style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)',
        padding: '0.75rem 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              background: 'var(--accent-primary)',
              padding: '7px 9px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)',
              flexShrink: 0
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
              <span className="nav-brand-subtitle" style={{
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

          {/* Desktop Navigation & Actions */}
          <div className="nav-desktop">
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
                  onClick={handleLogout}
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

          {/* Mobile & Tablet Top Bar Actions */}
          <div className="nav-mobile-actions">
            {/* Quick Cart button for immediate checkout access on mobile */}
            {(!isAuthenticated || isBuyer) && (
              <Link
                to="/cart"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)'
                }}
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={18} color="var(--accent-secondary)" />
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--accent-secondary)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px'
                  }}>
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{ width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--accent-secondary)" />}
            </button>

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="btn btn-secondary"
              style={{ width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} color="var(--accent-primary)" /> : <Menu size={20} color="var(--accent-primary)" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Menu Drawer */}
        <div className={`nav-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="container" style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {isAuthenticated && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', fontWeight: 700 }}>
                  Signed in as
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                  {user?.name || user?.email}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                  {user?.roles?.map(r => r.toUpperCase()).join(' • ')}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.92rem' }}
              >
                <BookOpen size={18} color="var(--accent-secondary)" /> Explore Catalog
              </Link>

              {isAuthenticated && isSeller && (
                <Link
                  to="/seller/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.92rem', color: 'var(--accent-secondary)' }}
                >
                  <Store size={18} color="var(--accent-secondary)" /> Seller Studio & Inventory
                </Link>
              )}

              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.92rem', color: 'var(--tertiary-guild)' }}
                >
                  <ShieldAlert size={18} color="var(--tertiary-guild)" /> Platform Admin Console
                </Link>
              )}

              {isAuthenticated && isBuyer && (
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.92rem' }}
                >
                  <User size={18} color="var(--text-muted)" /> My Acquisitions & Orders
                </Link>
              )}

              {(!isAuthenticated || isBuyer) && (
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.92rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={18} color="var(--accent-secondary)" /> View Shopping Cart
                  </div>
                  {totalItems > 0 && (
                    <span style={{
                      background: 'var(--accent-secondary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {totalItems} items
                    </span>
                  )}
                </Link>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
