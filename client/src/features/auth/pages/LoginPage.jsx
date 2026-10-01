import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, BookOpen } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, submitting, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/');
    } catch {
      // Handled by hook
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <BookOpen size={24} color="#fff" />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Log in to your BookWORM buyer / seller account
          </p>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', borderColor: '#ef4444', color: '#f87171', fontSize: '0.85rem' }}>
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
              placeholder="e.g. aarav@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            {submitting ? 'Authenticating...' : <><LogIn size={18} /> Log In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.75rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};
