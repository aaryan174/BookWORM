import React from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks.js';
import { RatingStars } from '../../../components/RatingStars.jsx';
import { Search, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

const CATEGORIES = ['ALL', 'Technology', 'Self-Help', 'History', 'Fiction', 'Science', 'Business'];

export const BookCatalogPage = () => {
  const { books, pagination, loading, error, filters, updateFilters } = useBooks();

  return (
    <div>
      {/* Stitch Sub-Hero Banner */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '2.5rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--accent-secondary)'
                }}>
                  Curated Catalog
                </span>
                <span style={{ color: 'var(--text-subtle)' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Verified Guild Edition 2026
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.15, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Explore the Literary Exchange
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                Authenticated trade editions, slipcased imprints, and verified volumes direct from certified independent booksellers.
              </p>
            </div>

            {/* Platform Credibility Metrics */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-subtle)',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--accent-secondary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>1,400+</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Catalog Titles</div>
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--tertiary-guild)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>Verified</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indie Sellers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '850px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 'min(280px, 100%)' }}>
              <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.6rem' }}
                placeholder="Search titles, authors, or ISBN-13..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 'min(180px, 100%)' }}
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Catalog Body */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        {/* Category Filter Chips */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '0.5rem',
          marginBottom: '2rem'
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters({ category: cat })}
              className={`btn ${filters.category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                flexShrink: 0
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content State */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Consulting catalog indexes...</p>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fecaca' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <BookOpen size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No catalog entries found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try resetting filters or searching with different keywords.</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.75rem'
            }}>
              {books.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className="book-card-glass"
                >
                  {/* Frosted Glass Cover Showcase Stage */}
                  <div className="book-cover-stage">
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="book-cover-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    <span
                      className="badge badge-glass"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '0.65rem'
                      }}
                    >
                      {book.category}
                    </span>
                  </div>

                  {/* Book Card Information */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.15rem',
                        marginBottom: '0.35rem',
                        lineHeight: 1.3,
                        color: 'var(--text-main)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {book.title}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                        By {book.authors.join(', ')}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '0.85rem',
                      marginTop: '0.5rem'
                    }}>
                      <RatingStars rating={book.averageRating} count={book.reviewCount} />
                      <span style={{
                        color: 'var(--accent-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.01em'
                      }}>
                        View Offers →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3.5rem' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateFilters({ page: p })}
                    className={`btn ${pagination.page === p ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '38px', height: '38px', padding: 0 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
