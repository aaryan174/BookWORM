import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../hooks/useSeller.js';
import { Store, ShieldCheck } from 'lucide-react';

export const SellerOnboardingPage = () => {
  const navigate = useNavigate();
  const { onboard, submitting } = useSeller();
  const [form, setForm] = useState({
    storeName: '',
    description: '',
    gstin: '',
    panNumber: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onboard(form);
      navigate('/seller/dashboard');
    } catch {
      // Handled by hook
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 4px 12px rgba(44, 36, 27, 0.15)'
          }}>
            <Store size={28} color="var(--accent-secondary)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-primary)' }}>Bookseller Studio Onboarding</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Establish your certified marketplace bookshop to publish titles and manage orders
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Store / Business Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Classic Book Bazaar"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Tell buyers about your bookshop specialty..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">GSTIN (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="07AAAAA0000A1Z5"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="ABCDE1234F"
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '10px', margin: '1rem 0 1.5rem 0', display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={20} color="#6366f1" style={{ flexShrink: 0 }} />
            <span>Platform Commission Rate is <strong>10%</strong> per item sold. Net seller earnings are tracked automatically in your Seller Sales Ledger.</span>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}>
            {submitting ? 'Creating Seller Profile...' : 'Complete Seller Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};
