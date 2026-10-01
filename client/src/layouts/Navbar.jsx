import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { useCartContext } from '../features/cart/context/CartContext.jsx';
import { BookOpen, ShoppingCart, User, Store, LogOut, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { totalItems } = useCartContext();
  const navigate = useNavigate();

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.85rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Book<span style={{ color: '#6366f1' }}>WORM</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Browse Catalog
          </Link>

          {isAuthenticated ? (
            <>
              {isSeller ? (
                <Link to="/seller/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <Store size={16} /> Seller Hub
                </Link>
              ) : (
                <Link to="/seller/onboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.3)' }}>
                  Start Selling
                </Link>
              )}

              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}

              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '8px' }}>
                <ShoppingCart size={22} color="#f9fafb" />
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ec4899',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {totalItems}
                  </span>
                )}
              </Link>

              <Link to="/orders" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                <User size={16} /> Orders
              </Link>

              <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-danger" style={{ padding: '0.5rem 0.85rem' }}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
