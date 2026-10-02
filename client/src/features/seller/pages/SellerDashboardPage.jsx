import React, { useState } from 'react';
import { useSeller } from '../hooks/useSeller.js';
import { bookApi } from '../../books/api/book.api.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { Store, Plus, Package, DollarSign, TrendingUp, CheckCircle, Trash2, ShieldCheck, Upload, Image as ImageIcon, BookOpen, Edit3, AlertTriangle, AlertCircle, Search, Layers, X } from 'lucide-react';

const getConditionBadgeClass = (condition) => {
  switch (condition?.toUpperCase()) {
    case 'NEW': return 'badge-new';
    case 'LIKE_NEW':
    case 'LIKE NEW': return 'badge-likenew';
    case 'GOOD': return 'badge-good';
    case 'FAIR': return 'badge-fair';
    default: return 'badge-info';
  }
};

export const SellerDashboardPage = () => {
  const { profile, listings, sales, loading, createListing, updateListing, deleteListing } = useSeller();
  const { addToast } = useToast();
  const [showAddListing, setShowAddListing] = useState(false);
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'new-imagekit'
  const [canonicalBooks, setCanonicalBooks] = useState([]);
  const [searchIsbn, setSearchIsbn] = useState('');

  // Stock tracking filters & search
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'SOLD_OUT'
  const [listingSearch, setListingSearch] = useState('');

  // Interactive Stock Edit Modal State
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({
    stockQuantity: 0,
    price: 0,
    condition: 'NEW',
    status: 'ACTIVE',
    descriptionNotes: ''
  });
  const [updatingStock, setUpdatingStock] = useState(false);

  // State for listing existing book
  const [newListing, setNewListing] = useState({
    bookId: '',
    condition: 'NEW',
    format: 'PAPERBACK',
    price: 499,
    stockQuantity: 10,
    descriptionNotes: ''
  });

  // State for creating new canonical book with ImageKit upload
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    authors: '',
    isbn13: '',
    category: 'Fiction',
    publisher: '',
    description: '',
    coverImageUrl: '',
    condition: 'NEW',
    format: 'HARDCOVER',
    price: 699,
    stockQuantity: 5,
    descriptionNotes: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [submittingBook, setSubmittingBook] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Synchronizing seller ledger & inventory catalog...</p>
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

  const handleImageKitFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Cover image size must not exceed 5MB.', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadSuccess(false);
      const res = await bookApi.uploadCoverImage(file);
      if (res.success && res.data?.url) {
        setNewBookForm(prev => ({ ...prev, coverImageUrl: res.data.url }));
        setUploadSuccess(true);
        addToast('Book cover uploaded successfully to ImageKit CDN!', 'success');
      }
    } catch (err) {
      const errorMsg = err.statusCode === 401
        ? 'Your session has expired. Please log in again.'
        : (err.message || 'Image upload failed. Please try again.');
      addToast(`ImageKit Upload: ${errorMsg}`, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateBookWithImageKit = async (e) => {
    e.preventDefault();
    if (!newBookForm.coverImageUrl) {
      addToast('Please upload a book cover image via ImageKit before publishing.', 'warning');
      return;
    }

    try {
      setSubmittingBook(true);
      // 1. Create canonical book in master catalog
      const bookPayload = {
        title: newBookForm.title.trim(),
        authors: newBookForm.authors.split(',').map(a => a.trim()).filter(Boolean),
        isbn13: newBookForm.isbn13.trim(),
        category: newBookForm.category,
        publisher: newBookForm.publisher.trim(),
        description: newBookForm.description.trim(),
        coverImageUrl: newBookForm.coverImageUrl
      };

      const bookRes = await bookApi.createBook(bookPayload);
      const createdBookId = bookRes.data?.book?._id;

      if (createdBookId) {
        // 2. Create seller listing for the physical copies
        await createListing({
          bookId: createdBookId,
          condition: newBookForm.condition,
          format: newBookForm.format,
          price: Number(newBookForm.price),
          stockQuantity: Number(newBookForm.stockQuantity),
          descriptionNotes: newBookForm.descriptionNotes
        });

        addToast('Book catalog entry created and physical copies listed for sale!', 'success');
        setShowAddListing(false);
        setNewBookForm({
          title: '',
          authors: '',
          isbn13: '',
          category: 'Fiction',
          publisher: '',
          description: '',
          coverImageUrl: '',
          condition: 'NEW',
          format: 'HARDCOVER',
          price: 699,
          stockQuantity: 5,
          descriptionNotes: ''
        });
        setUploadSuccess(false);
      }
    } catch (err) {
      addToast(`Failed to create book: ${err.message}`, 'error');
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleOpenEditModal = (listing) => {
    setEditingListing(listing);
    setEditForm({
      stockQuantity: listing.stockQuantity ?? 0,
      price: listing.price ?? 0,
      condition: listing.condition || 'NEW',
      status: listing.status || 'ACTIVE',
      descriptionNotes: listing.descriptionNotes || ''
    });
  };

  const handleSaveStockUpdate = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      setUpdatingStock(true);
      const newStock = Math.max(0, parseInt(editForm.stockQuantity, 10) || 0);
      const payload = {
        stockQuantity: newStock,
        price: parseFloat(editForm.price) || 0,
        condition: editForm.condition,
        status: newStock === 0 ? 'SOLD_OUT' : editForm.status,
        descriptionNotes: editForm.descriptionNotes
      };
      await updateListing(editingListing._id, payload);
      addToast(`Updated stock & price for "${editingListing.bookId?.title || 'Book'}"`, 'success');
      setEditingListing(null);
    } catch (err) {
      addToast(`Failed to update stock: ${err.message}`, 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleQuickStockChange = async (listing, delta) => {
    const newQty = Math.max(0, (listing.stockQuantity || 0) + delta);
    try {
      await updateListing(listing._id, {
        stockQuantity: newQty,
        status: newQty === 0 ? 'SOLD_OUT' : 'ACTIVE'
      });
      addToast(`Stock for "${listing.bookId?.title || 'Book'}" adjusted to ${newQty}`, 'info');
    } catch (err) {
      addToast(`Quick stock update failed: ${err.message}`, 'error');
    }
  };

  // Stock calculations & filters
  const totalStockUnits = listings.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
  const inStockListings = listings.filter(item => (item.stockQuantity || 0) > 3);
  const lowStockListings = listings.filter(item => (item.stockQuantity || 0) >= 1 && (item.stockQuantity || 0) <= 3);
  const soldOutListings = listings.filter(item => (item.stockQuantity || 0) === 0);

  const filteredListings = listings.filter(item => {
    if (stockFilter === 'IN_STOCK' && (item.stockQuantity || 0) <= 3) return false;
    if (stockFilter === 'LOW_STOCK' && ((item.stockQuantity || 0) < 1 || (item.stockQuantity || 0) > 3)) return false;
    if (stockFilter === 'SOLD_OUT' && (item.stockQuantity || 0) > 0) return false;

    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      const titleMatch = item.bookId?.title?.toLowerCase().includes(q);
      const isbnMatch = item.bookId?.isbn13?.toLowerCase().includes(q);
      const conditionMatch = item.condition?.toLowerCase().includes(q);
      if (!titleMatch && !isbnMatch && !conditionMatch) return false;
    }
    return true;
  });

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
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Stitch Seller Studio Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-secondary)' }}>
              Seller Studio Environment
            </span>
            <span style={{ color: 'var(--text-subtle)' }}>•</span>
            <span className="badge badge-success" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              <ShieldCheck size={12} /> Certified Bookseller
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
            <Store color="var(--accent-secondary)" size={28} /> {profile?.storeName || 'The Archival Bookshop'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage physical copies, inventory stock, condition grading, and escrow settlements.
          </p>
        </div>

        <button onClick={() => setShowAddListing(!showAddListing)} className="btn btn-primary" style={{ padding: '0.75rem 1.4rem' }}>
          <Plus size={18} /> {showAddListing ? 'Close Publisher' : '+ Add / Publish Book'}
        </button>
      </div>

      {/* Operational Bento Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} color="var(--accent-primary)" /> Active Catalog Inventory
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {listings.length} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>Volumes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>Verified in marketplace index</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} color="var(--tertiary-guild)" /> Orders Processed
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--tertiary-guild)' }}>
            {sales.length} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>Dispatches</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>Fulfillment & delivery verified</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} color="var(--accent-secondary)" /> Net Settlement Escrow
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            ₹{totalNetEarnings}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>Post 10% platform fee deduction</div>
        </div>
      </div>

      {/* Publish Listing / ImageKit Upload Modal Drawer */}
      {showAddListing && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'var(--bg-surface)', border: '1px solid var(--accent-secondary)' }}>
          {/* Mode Switch Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`btn ${activeTab === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <BookOpen size={16} /> 1. List Existing Canonical Title
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new-imagekit')}
              className={`btn ${activeTab === 'new-imagekit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <Upload size={16} /> 2. Upload New Book with ImageKit
            </button>
          </div>

          {/* TAB 1: List against existing book */}
          {activeTab === 'existing' ? (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                Publish Book Listing against Canonical ISBN
              </h3>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Search Canonical Book Catalog (Title / Author / ISBN)</label>
                <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search canonical title or ISBN-13..."
                    value={searchIsbn}
                    onChange={(e) => setSearchIsbn(e.target.value)}
                  />
                  <button type="button" onClick={handleSearchBook} className="btn btn-secondary">Search</button>
                </div>
              </div>

              {canonicalBooks.length > 0 && (
                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Canonical Match:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {canonicalBooks.map((b) => (
                      <label key={b._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: newListing.bookId === b._id ? 'var(--bg-surface-high)' : 'transparent',
                        border: newListing.bookId === b._id ? '1px solid var(--accent-secondary)' : '1px solid transparent'
                      }}>
                        <input
                          type="radio"
                          name="bookSelect"
                          checked={newListing.bookId === b._id}
                          onChange={() => setNewListing({ ...newListing, bookId: b._id })}
                        />
                        <span style={{ fontSize: '0.9rem' }}>
                          <strong>{b.title}</strong> by {b.authors.join(', ')} • <span style={{ color: 'var(--text-muted)' }}>ISBN: {b.isbn13}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handlePublishListing}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Condition Grade</label>
                    <select className="form-select" value={newListing.condition} onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}>
                      <option value="NEW">New (Pristine / Unread)</option>
                      <option value="LIKE_NEW">Like New (Mint)</option>
                      <option value="VERY_GOOD">Very Good</option>
                      <option value="GOOD">Good (Light Wear)</option>
                      <option value="ACCEPTABLE">Acceptable / Reading Copy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Binding & Format</label>
                    <select className="form-select" value={newListing.format} onChange={(e) => setNewListing({ ...newListing, format: e.target.value })}>
                      <option value="PAPERBACK">Trade Paperback</option>
                      <option value="HARDCOVER">Hardcover / Slipcased</option>
                      <option value="EBOOK">Ebook</option>
                      <option value="AUDIOBOOK">Audiobook</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Listing Price (INR)</label>
                    <input type="number" className="form-input" required min={1} value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: parseFloat(e.target.value) })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Inventory</label>
                    <input type="number" className="form-input" required min={1} value={newListing.stockQuantity} onChange={(e) => setNewListing({ ...newListing, stockQuantity: parseInt(e.target.value, 10) })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Provenance & Condition Notes</label>
                  <input type="text" className="form-input" placeholder="e.g. Acid-free storage, clean dust jacket, no foxing" value={newListing.descriptionNotes} onChange={(e) => setNewListing({ ...newListing, descriptionNotes: e.target.value })} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                  <button type="submit" disabled={!newListing.bookId} className="btn btn-primary">Publish to Marketplace</button>
                  <button type="button" onClick={() => setShowAddListing(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            /* TAB 2: Upload new book with ImageKit */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
                    Publish New Book to Marketplace
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add a title that doesn't exist in the catalog yet, and put your store's copies up for sale.
                  </p>
                </div>
                <span className="badge badge-success"><Upload size={12} /> ImageKit CDN Integration</span>
              </div>

              {/* Explanatory callout for marketplace structure */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: 'var(--text-main)'
              }}>
                <BookOpen size={20} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>How BookWORM Marketplace Works:</strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Because multiple sellers can offer copies of the same book, listing a new title has two parts:
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}> Part 1</span> saves the book's title, authors, and cover image to the universal library catalog.
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}> Part 2</span> sets your bookstore's price and stock so customers can purchase your physical copies.
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateBookWithImageKit}>
                {/* STEP 1: Master Catalog Entry */}
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{
                      background: 'var(--accent-secondary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      PART 1
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--accent-primary)', margin: 0 }}>
                      Master Catalog & Book Details
                    </h4>
                  </div>

                  {/* Book Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Book Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. The Name of the Rose"
                        value={newBookForm.title}
                        onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Author(s) (Comma-separated) *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. Umberto Eco, William Weaver"
                        value={newBookForm.authors}
                        onChange={(e) => setNewBookForm({ ...newBookForm, authors: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ISBN-13 *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. 9780156001311"
                        value={newBookForm.isbn13}
                        onChange={(e) => setNewBookForm({ ...newBookForm, isbn13: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Publisher *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        placeholder="e.g. Harcourt Brace & Co"
                        value={newBookForm.publisher}
                        onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        value={newBookForm.category}
                        onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                      >
                        <option value="Fiction">Fiction</option>
                        <option value="History">History</option>
                        <option value="Philosophy">Philosophy</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Book Description & Bibliographical Synopsis *</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      required
                      placeholder="Provide a historical synopsis, edition details, or publisher summary..."
                      value={newBookForm.description}
                      onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                    />
                  </div>

                  {/* ImageKit Cover Upload Section */}
                  <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
                    Book Cover Image * (Powered by ImageKit CDN)
                  </label>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1.5px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ width: '85px', height: '115px', background: '#ede8de', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {newBookForm.coverImageUrl ? (
                        <img src={newBookForm.coverImageUrl} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={30} color="var(--text-subtle)" />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem', color: 'var(--accent-primary)' }}>
                        Select High-Resolution Book Cover
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Supports JPEG, PNG, WEBP or AVIF up to 5MB. Uploads securely to ImageKit.
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          disabled={uploadingImage}
                          onChange={handleImageKitFileUpload}
                          style={{ fontSize: '0.85rem' }}
                        />
                        {uploadingImage && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-secondary)' }}>
                            <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                            <span>Uploading to ImageKit CDN...</span>
                          </div>
                        )}
                        {uploadSuccess && (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> Cover Uploaded to ImageKit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Your Store Listing (Copies for Sale) */}
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: 'var(--accent-primary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      PART 2
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--accent-primary)', margin: 0 }}>
                      Your Store Pricing & Copies in Stock
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Set the physical condition, format, selling price, and number of copies you have available in your store.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Condition Grade *</label>
                      <select className="form-select" value={newBookForm.condition} onChange={(e) => setNewBookForm({ ...newBookForm, condition: e.target.value })}>
                        <option value="NEW">New (Pristine / Unread)</option>
                        <option value="LIKE_NEW">Like New (Mint)</option>
                        <option value="VERY_GOOD">Very Good</option>
                        <option value="GOOD">Good (Light Wear)</option>
                        <option value="ACCEPTABLE">Acceptable / Reading Copy</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Binding & Format *</label>
                      <select className="form-select" value={newBookForm.format} onChange={(e) => setNewBookForm({ ...newBookForm, format: e.target.value })}>
                        <option value="HARDCOVER">Hardcover / Slipcased</option>
                        <option value="PAPERBACK">Trade Paperback</option>
                        <option value="EBOOK">Ebook</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Your Selling Price (₹ INR) *</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min={1}
                        placeholder="e.g. 499"
                        value={newBookForm.price}
                        onChange={(e) => setNewBookForm({ ...newBookForm, price: parseFloat(e.target.value) || '' })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Copies Available in Stock *</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        min={1}
                        placeholder="e.g. 5"
                        value={newBookForm.stockQuantity}
                        onChange={(e) => setNewBookForm({ ...newBookForm, stockQuantity: parseInt(e.target.value, 10) || '' })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">Condition & Provenance Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. First edition printing, crisp spine, unread collector copy"
                      value={newBookForm.descriptionNotes}
                      onChange={(e) => setNewBookForm({ ...newBookForm, descriptionNotes: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                  <button
                    type="submit"
                    disabled={submittingBook || !newBookForm.coverImageUrl}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem' }}
                  >
                    {submittingBook ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Registering & Listing Book...
                      </span>
                    ) : (
                      'Publish Book to Catalog & Put on Sale'
                    )}
                  </button>
                  <button type="button" onClick={() => setShowAddListing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Inventory & Stock Tracking Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--accent-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={22} color="var(--accent-secondary)" />
            Inventory Stock & Listing Control
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Real-time stock ledger, unit reserves, pricing adjustments, and inventory tracking.
          </p>
        </div>

        {/* Quick Stock Stat Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Layers size={14} color="var(--text-subtle)" />
            <span>Total Units: <strong style={{ color: 'var(--text-main)' }}>{totalStockUnits}</strong></span>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid #bbf7d0',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tertiary-guild)' }}></span>
            <span>Healthy: <strong style={{ color: 'var(--tertiary-guild)' }}>{inStockListings.length}</strong></span>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid #fde68a',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span>
            <span>Low Stock: <strong style={{ color: 'var(--warning)' }}>{lowStockListings.length}</strong></span>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid #fecaca',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
            <span>Sold Out: <strong style={{ color: 'var(--danger)' }}>{soldOutListings.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        background: 'var(--bg-secondary)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStockFilter('ALL')}
            className={`btn ${stockFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            All Items ({listings.length})
          </button>
          <button
            onClick={() => setStockFilter('IN_STOCK')}
            className={`btn ${stockFilter === 'IN_STOCK' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            In Stock ({inStockListings.length})
          </button>
          <button
            onClick={() => setStockFilter('LOW_STOCK')}
            className={`btn ${stockFilter === 'LOW_STOCK' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            Low Stock ({lowStockListings.length})
          </button>
          <button
            onClick={() => setStockFilter('SOLD_OUT')}
            className={`btn ${stockFilter === 'SOLD_OUT' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            Sold Out ({soldOutListings.length})
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search title, ISBN, condition..."
            value={listingSearch}
            onChange={(e) => setListingSearch(e.target.value)}
            style={{ padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.82rem' }}
          />
          <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Inventory Listings Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', marginBottom: '3rem', background: 'var(--bg-surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Book Title & Edition</th>
              <th style={{ padding: '1rem' }}>Condition Grade</th>
              <th style={{ padding: '1rem' }}>Selling Price</th>
              <th style={{ padding: '1rem' }}>Stock Control & Tracking</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {listings.length === 0
                    ? 'No active listings in your inventory. Click "+ Add / Publish Book" above to begin.'
                    : 'No listings match your selected filter or search keyword.'}
                </td>
              </tr>
            ) : (
              filteredListings.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {/* Book Snapshot */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {item.bookId?.coverImageUrl ? (
                        <img
                          src={item.bookId.coverImageUrl}
                          alt=""
                          style={{ width: '38px', height: '52px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-color)', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '38px', height: '52px', background: 'var(--bg-secondary)', borderRadius: '2px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={16} color="var(--text-subtle)" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {item.bookId?.title || 'Canonical Book'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.format} • ISBN: {item.bookId?.isbn13 || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Condition */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${getConditionBadgeClass(item.condition)}`}>
                      {item.condition?.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '1.05rem' }}>
                    ₹{item.price}
                  </td>

                  {/* Stock Tracking & Quick Adjust Controls */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Decrement stock button */}
                      <button
                        onClick={() => handleQuickStockChange(item, -1)}
                        disabled={item.stockQuantity <= 0}
                        title="Reduce stock by 1 unit"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-high)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          cursor: item.stockQuantity <= 0 ? 'not-allowed' : 'pointer',
                          opacity: item.stockQuantity <= 0 ? 0.35 : 1
                        }}
                      >
                        -
                      </button>

                      {/* Stock units display */}
                      <span style={{
                        minWidth: '32px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: item.stockQuantity === 0 ? 'var(--danger)' : item.stockQuantity <= 3 ? 'var(--warning)' : 'var(--tertiary-guild)'
                      }}>
                        {item.stockQuantity}
                      </span>

                      {/* Increment stock button */}
                      <button
                        onClick={() => handleQuickStockChange(item, 1)}
                        title="Add 1 unit to stock"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-high)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>

                      {/* Visual Stock Level Indicator Badge */}
                      {item.stockQuantity === 0 ? (
                        <span className="badge badge-danger" style={{ textTransform: 'none', marginLeft: '0.35rem', gap: '0.25rem' }}>
                          <AlertTriangle size={11} /> Sold Out
                        </span>
                      ) : item.stockQuantity <= 3 ? (
                        <span className="badge badge-warning" style={{ textTransform: 'none', marginLeft: '0.35rem', gap: '0.25rem' }}>
                          <AlertCircle size={11} /> Low ({item.stockQuantity})
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ textTransform: 'none', marginLeft: '0.35rem', gap: '0.25rem' }}>
                          <CheckCircle size={11} /> In Stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Edit stock, price, and listing status"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => deleteListing(item._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        title="Deactivate listing"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Edit Stock & Price Modal */}
      {editingListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-hover)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-secondary)' }}>
                  Inventory Control Studio
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                  Edit Stock & Pricing
                </h3>
              </div>
              <button
                onClick={() => setEditingListing(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <BookOpen size={22} color="var(--accent-secondary)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {editingListing.bookId?.title || 'Book Title'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ISBN: {editingListing.bookId?.isbn13 || 'N/A'} • Format: {editingListing.format}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveStockUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Available Copies in Stock *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min={0}
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                  />
                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                    {[1, 5, 10].map(addVal => (
                      <button
                        type="button"
                        key={addVal}
                        onClick={() => setEditForm(prev => ({ ...prev, stockQuantity: (parseInt(prev.stockQuantity, 10) || 0) + addVal }))}
                        className="btn btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        +{addVal}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, stockQuantity: 0 }))}
                      className="btn btn-danger"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      Sold Out
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Listing Price (₹ INR) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min={1}
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                    Settlement: ~₹{(editForm.price * 0.9).toFixed(2)} (after 10% fee)
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Condition Grade</label>
                  <select
                    className="form-select"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                  >
                    <option value="NEW">New (Pristine / Unread)</option>
                    <option value="LIKE_NEW">Like New (Mint)</option>
                    <option value="VERY_GOOD">Very Good</option>
                    <option value="GOOD">Good (Light Wear)</option>
                    <option value="ACCEPTABLE">Acceptable / Reading Copy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Listing Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active (Available for Sale)</option>
                    <option value="SOLD_OUT">Sold Out</option>
                    <option value="INACTIVE">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Condition & Provenance Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acid-free dust jacket, clean spine, second printing"
                  value={editForm.descriptionNotes}
                  onChange={(e) => setEditForm({ ...editForm, descriptionNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="btn btn-secondary"
                  disabled={updatingStock}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingStock}
                  style={{ minWidth: '150px' }}
                >
                  {updatingStock ? 'Saving Updates...' : 'Save Stock Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Orders Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
        Seller Sales & Settlement Ledger
      </h2>
      <div className="glass-panel" style={{ overflowX: 'auto', background: 'var(--bg-surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Order Ref</th>
              <th style={{ padding: '1rem' }}>Book Item Snapshot</th>
              <th style={{ padding: '1rem' }}>Qty</th>
              <th style={{ padding: '1rem' }}>Subtotal</th>
              <th style={{ padding: '1rem' }}>Platform Fee (10%)</th>
              <th style={{ padding: '1rem' }}>Your Settlement</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer orders recorded yet.
                </td>
              </tr>
            ) : (
              sales.map((order) =>
                order.items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{order.orderNumber}</td>
                    <td style={{ padding: '1rem' }}>{item.bookTitleSnapshot}</td>
                    <td style={{ padding: '1rem' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem' }}>₹{item.subtotal}</td>
                    <td style={{ padding: '1rem', color: 'var(--danger)' }}>-₹{item.platformCommissionAmount}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--tertiary-guild)' }}>₹{item.sellerEarningsAmount}</td>
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
