import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin.api.js';
import { ShieldCheck, Users, BookOpen, DollarSign, Store } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anaRes, usersRes] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getUsers({})
        ]);

        if (anaRes.success) setAnalytics(anaRes.data.analytics);
        if (usersRes.success) setUsersList(usersRes.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading marketplace platform telemetry...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--tertiary-guild)' }}>
            Supervisory Console
          </span>
          <span style={{ color: 'var(--text-subtle)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            System Integrity & Settlements
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--accent-primary)'
        }}>
          <ShieldCheck color="var(--tertiary-guild)" size={28} /> Platform Administration & Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Real-time oversight of verified users, canonical catalog volumes, seller hubs, and escrow commissions.
        </p>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--accent-primary)" /> Platform Members
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {analytics.users}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>Active buyer/seller accounts</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={16} color="var(--accent-secondary)" /> Certified Sellers
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
              {analytics.sellers}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>Independent bookshops</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="var(--accent-primary)" /> Canonical Catalog
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {analytics.books}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>ISBN master records</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} color="var(--tertiary-guild)" /> Platform Commission (10%)
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--tertiary-guild)' }}>
              ₹{analytics.financials?.platformCommissionRevenue || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>Escrow fee revenue</div>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
        Registered Marketplace Users
      </h2>
      <div className="glass-panel" style={{ overflowX: 'auto', background: 'var(--bg-surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>User Full Name</th>
              <th style={{ padding: '1rem' }}>Email Address</th>
              <th style={{ padding: '1rem' }}>Marketplace Roles</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {u.roles.map((r) => (
                      <span key={r} className={`badge ${r === 'admin' ? 'badge-danger' : r === 'seller' ? 'badge-warning' : 'badge-info'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
