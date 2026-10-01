import React, { useState } from 'react';
import { useSeller } from '../hooks/useSeller.js';
import { bookApi } from '../../books/api/book.api.js';
import { Store, Plus, Package, DollarSign, TrendingUp, CheckCircle, Trash2 } from 'lucide-react';

export const SellerDashboardPage = () => {
  const { profile, listings, sales, loading, createListing, deleteListing } = useSeller();
  const [showAddListing, setShowAddListing] = useState(false);
  const [canonicalBooks, setCanonicalBooks] = useState([]);
  const [searchIsbn, setSearchIsbn] = useState('');

  const [newListing, setNewListing] = useState({
    bookId: '',
    condition: 'NEW',
    format: 'PAPERBACK',
    price: 499,
    stockQuantity: 10,
    descriptionNotes: ''
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  const handleSearchBook = async () => {
    try {
      const res = await bookApi.getBooks({ search: searchIsbn });
      if (res.success && res.data.books) {
        setCanonicalBooks(res.data.books);
      }
    } catch {
      setCanonicalBooks([]);
    }
  };

  const handlePublishListing = async (e) => {
    e.preventDefault();
    await createListing(newListing);
    setShowAddListing(false);
    setNewListing({ bookId: '', condition: 'NEW', format: 'PAPERBACK', price: 499, stockQuantity: 10, descriptionNotes: '' });
  };

  // Calculate gross sales & net earnings
  let totalSalesVolume = 0;
  let totalNetEarnings = 0;
  sales.forEach(order => {
    order.items.forEach(item => {
      totalSalesVolume += item.subtotal || 0;
      totalNetEarnings += item.sellerEarningsAmount || 0;
    });
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Store color="#ec4899" size={28} /> {profile?.storeName || 'Seller Hub'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage listings, monitor stock levels, and view net earnings
          </p>
        </div>

        <button onClick={() => setShowAddListing(!showAddListing)} className="btn btn-primary">
          <Plus size={18} /> Publish New Book Listing
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} color="#6366f1" /> Active Listings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{listings.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="#10b981" /> Total Orders
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{sales.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} color="#ec4899" /> Net Seller Earnings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>₹{totalNetEarnings}</div>
        </div>
      </div>

      {/* Create Listing Form Modal */}
      {showAddListing && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'rgba(17, 24, 39, 0.95)', border: '1px solid #6366f1' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Publish Seller Book Listing</h3>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Search Canonical Book Catalog (Title / ISBN)</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type book title or ISBN..."
                value={searchIsbn}
                onChange={(e) => setSearchIsbn(e.target.value)}
              />
              <button type="button" onClick={handleSearchBook} className="btn btn-secondary">Search Catalog</button>
            </div>
          </div>

          {canonicalBooks.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Book from Catalog:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {canonicalBooks.map((b) => (
                  <label key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', background: newListing.bookId === b._id ? 'rgba(99, 102, 241, 0.2)' : 'transparent' }}>
                    <input
                      type="radio"
                      name="bookSelect"
                      checked={newListing.bookId === b._id}
                      onChange={() => setNewListing({ ...newListing, bookId: b._id })}
                    />
                    <span><strong>{b.title}</strong> by {b.authors.join(', ')} (ISBN: {b.isbn13})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handlePublishListing}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-select" value={newListing.condition} onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="VERY_GOOD">Very Good</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="form-select" value={newListing.format} onChange={(e) => setNewListing({ ...newListing, format: e.target.value })}>
                  <option value="PAPERBACK">Paperback</option>
                  <option value="HARDCOVER">Hardcover</option>
                  <option value="EBOOK">Ebook</option>
                  <option value="AUDIOBOOK">Audiobook</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (INR)</label>
                <input type="number" className="form-input" required min={1} value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: parseFloat(e.target.value) })} />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-input" required min={1} value={newListing.stockQuantity} onChange={(e) => setNewListing({ ...newListing, stockQuantity: parseInt(e.target.value, 10) })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Condition Notes</label>
              <input type="text" className="form-input" placeholder="e.g. Brand new sealed copy" value={newListing.descriptionNotes} onChange={(e) => setNewListing({ ...newListing, descriptionNotes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" disabled={!newListing.bookId} className="btn btn-primary">Publish Listing</button>
              <button type="button" onClick={() => setShowAddListing(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Listings Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Your Active Listings ({listings.length})</h2>
      <div className="glass-panel" style={{ overflowX: 'auto', marginBottom: '3rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Book Title</th>
              <th style={{ padding: '1rem' }}>Condition</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active listings. Click "Publish New Book Listing" above.</td>
              </tr>
            ) : (
              listings.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{item.bookId?.title || 'Canonical Book'}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-info">{item.condition}</span></td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#10b981' }}>₹{item.price}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{item.stockQuantity}</td>
                  <td style={{ padding: '1rem' }}><span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{item.status}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => deleteListing(item._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      <Trash2 size={14} /> Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sales Orders Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Seller Sales Ledger</h2>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Order Ref</th>
              <th style={{ padding: '1rem' }}>Book Item</th>
              <th style={{ padding: '1rem' }}>Qty</th>
              <th style={{ padding: '1rem' }}>Subtotal</th>
              <th style={{ padding: '1rem' }}>Commission (10%)</th>
              <th style={{ padding: '1rem' }}>Your Net Earnings</th>
              <th style={{ padding: '1rem' }}>Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sales transactions recorded yet.</td>
              </tr>
            ) : (
              sales.map((order) =>
                order.items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{order.orderNumber}</td>
                    <td style={{ padding: '1rem' }}>{item.bookTitleSnapshot}</td>
                    <td style={{ padding: '1rem' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem' }}>₹{item.subtotal}</td>
                    <td style={{ padding: '1rem', color: '#f87171' }}>-₹{item.platformCommissionAmount}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#10b981' }}>₹{item.sellerEarningsAmount}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-success"><CheckCircle size={12} /> {item.itemStatus}</span></td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
