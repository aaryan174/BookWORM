import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { UserPlus, BookOpen, Store, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, submitting, error } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    storeName: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      if (form.role === 'seller' || form.role === 'both') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      // Handled by auth hook
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem 5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', background: 'var(--bg-surface)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--accent-primary)',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
          }}>
            <BookOpen size={24} color="#fcf9f2" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', color: 'var(--accent-primary)', marginBottom: '0.35rem' }}>
            Join the Literary Guild
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Create your account to acquire or sell authenticated books
          </p>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderColor: '#fecaca', color: 'var(--danger)', background: '#fee2e2', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Role Selector */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>
              How do you plan to use BookWORM?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Buyer Option */}
              <div
                onClick={() => setForm({ ...form, role: 'buyer' })}
                style={{
                  border: `1.5px solid ${form.role === 'buyer' ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                  background: form.role === 'buyer' ? 'var(--bg-surface-high)' : 'var(--bg-primary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    <BookOpen size={16} color="var(--accent-secondary)" />
                    <span>Buy Books</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === 'buyer'}
                    onChange={() => setForm({ ...form, role: 'buyer' })}
                  />
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  Collector acquiring and ordering verified books.
                </p>
              </div>

              {/* Seller Option */}
              <div
                onClick={() => setForm({ ...form, role: 'seller' })}
                style={{
                  border: `1.5px solid ${form.role === 'seller' ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                  background: form.role === 'seller' ? 'var(--bg-surface-high)' : 'var(--bg-primary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    <Store size={16} color="var(--tertiary-guild)" />
                    <span>Sell Only</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={form.role === 'seller'}
                    onChange={() => setForm({ ...form, role: 'seller' })}
                  />
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  Bookseller listing stock copies. (Cannot buy).
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '0.65rem',
              padding: '0.6rem 0.85rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4
            }}>
              ⚖️ <strong style={{ color: 'var(--accent-primary)' }}>Marketplace Rule:</strong> Buyers can order books. Sellers can only list titles and track inventory stock (cannot place orders).
            </div>
          </div>

          {/* Optional Store Name if Selling */}
          {form.role === 'seller' && (
            <div className="form-group" style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem'
            }}>
              <label className="form-label" style={{ color: 'var(--accent-primary)' }}>
                Storefront / Bookseller Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Arcadia Rare Prints & Books"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '3px' }}>
                Leave empty to automatically use your name as store title.
              </span>
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Julian Vance"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="e.g. julian@arcadiabooks.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password with Eye show/hide button */}
          <div className="form-group">
            <label className="form-label">Password (Min 8 Characters)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                style={{ paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-subtle)',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem', fontSize: '1rem' }}
          >
            {submitting ? 'Creating Guild Account...' : (
              <>
                <UserPlus size={18} />
                {form.role === 'seller' ? 'Create Bookseller Account' : form.role === 'both' ? 'Create Dual Account' : 'Create Reader Account'}
              </>
            )}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}>
          <ShieldCheck size={14} color="var(--tertiary-guild)" />
          <span>Encrypted credentials & secure JWT token storage</span>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>Log In Here</Link>
        </p>
      </div>
    </div>
  );
};
