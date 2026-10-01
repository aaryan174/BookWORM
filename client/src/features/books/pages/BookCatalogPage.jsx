import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks.js';
import { RatingStars } from '../../../components/RatingStars.jsx';
import { Search, Filter, BookOpen } from 'lucide-react';

const CATEGORIES = ['ALL', 'Technology', 'Self-Help', 'History', 'Fiction', 'Science', 'Business'];

export const BookCatalogPage = () => {
  const { books, pagination, loading, error, filters, updateFilters } = useBooks();

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%)' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>Discover Millions of Books Across Sellers</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', marginBottom: '1.5rem' }}>
          BookWORM is a multi-vendor book marketplace. Compare prices, conditions, and seller ratings for every book title.
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '700px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.6rem' }}
              placeholder="Search by book title, author, or ISBN-13..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={filters.sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="rating">Top Rated</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilters({ category: cat })}
            className={`btn ${filters.category === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', borderRadius: '9999px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <p style={{ color: '#f87171' }}>{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <BookOpen size={48} color="#6b7280" style={{ marginBottom: '1rem' }} />
          <h3>No books found matching your query</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category filter.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            {books.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="glass-panel glass-panel-hover"
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div style={{ height: '240px', background: '#1f2937', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-info" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {book.category}
                  </span>
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {book.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      By {book.authors.join(', ')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <RatingStars rating={book.averageRating} count={book.reviewCount} />
                    <span style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 600 }}>View Sellers →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilters({ page: p })}
                  className={`btn ${pagination.page === p ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
