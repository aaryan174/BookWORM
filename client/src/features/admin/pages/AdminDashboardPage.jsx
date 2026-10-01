import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin.api.js';
import { ShieldAlert, Users, BookOpen, DollarSign, Store } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert color="#10b981" size={28} /> Platform Administration & Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time oversight of users, marketplace volume, platform revenue commission, and seller profiles.
        </p>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#3b82f6" /> Total Platform Users
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{analytics.users}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={16} color="#ec4899" /> Active Sellers
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>{analytics.sellers}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="#6366f1" /> Canonical Catalog
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>{analytics.books}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} color="#10b981" /> Platform Commission Revenue (10%)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>₹{analytics.financials?.platformCommissionRevenue}</div>
          </div>
        </div>
      )}

      {/* Users Management Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Registered Platform Users</h2>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>User Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Assigned Roles</th>
              <th style={{ padding: '1rem' }}>Account Status</th>
              <th style={{ padding: '1rem' }}>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '1rem' }}>{u.email}</td>
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
