import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, BookOpen, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, submitting, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/');
    } catch {
      // Handled by auth hook
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'var(--bg-surface)' }}>
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
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Log in to your BookWORM reader / bookseller account
          </p>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderColor: '#fecaca', color: 'var(--danger)', background: '#fee2e2', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label className="form-label">Password</label>
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

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem', fontSize: '1rem' }}
          >
            {submitting ? 'Authenticating...' : <><LogIn size={18} /> Enter Marketplace</>}
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
          <span>HTTP-only secure cookie session</span>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>Join the Guild</Link>
        </p>
      </div>
    </div>
  );
};
