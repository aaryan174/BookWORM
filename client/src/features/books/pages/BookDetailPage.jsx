import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookDetails } from '../hooks/useBookDetails.js';
import { useCart } from '../../cart/hooks/useCart.js';
import { useReviews } from '../../reviews/hooks/useReviews.js';
import { useAuthContext } from '../../auth/context/AuthContext.jsx';
import { RatingStars } from '../../../components/RatingStars.jsx';
import { ShoppingBag, Store, ShieldCheck, BookOpen, CheckCircle2, Award } from 'lucide-react';

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

export const BookDetailPage = () => {
  const { id } = useParams();
  const { book, listings, loading, error } = useBookDetails(id);
  const { addToCart, updatingId } = useCart();
  const { reviews, submitReview, submitting: submittingReview } = useReviews(id);
  const { isAuthenticated, isSeller, isBuyer } = useAuthContext();

  const [reviewForm, setReviewForm] = useState({ orderId: '', rating: 5, title: '', comment: '' });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving bookplate provenance & seller offers...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Book Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'The requested catalog item does not exist.'}</p>
          <Link to="/" className="btn btn-primary">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    await submitReview({ bookId: id, ...reviewForm });
    setReviewForm({ orderId: '', rating: 5, title: '', comment: '' });
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Book Presentation Banner */}
      <div className="glass-panel book-detail-hero" style={{
        padding: '2.5rem',
        marginBottom: '3rem',
        background: 'var(--bg-surface)'
      }}>
        {/* Recessed Cover Mat */}
        <div style={{
          background: '#ede8de',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-color)',
          minHeight: '360px'
        }}>
          <img
            src={book.coverImageUrl}
            alt={book.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop';
            }}
            style={{
              maxHeight: '320px',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '2px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.22), inset 0 0 0 1px rgba(15, 23, 42, 0.08)'
            }}
          />
        </div>

        {/* Book Bibliographical Header */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-info">{book.category}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Archival Imprint</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2.4rem',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
              color: 'var(--accent-primary)'
            }}>
              {book.title}
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Authored by <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{book.authors.join(', ')}</strong>
            </p>

            {/* Bibliographical Meta Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '0.85rem 1.25rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <RatingStars rating={book.averageRating} count={book.reviewCount} />
              <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>
              <div><span style={{ color: 'var(--text-subtle)' }}>ISBN-13:</span> <strong>{book.isbn13}</strong></div>
              <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>
              <div><span style={{ color: 'var(--text-subtle)' }}>Publisher:</span> <strong>{book.publisher}</strong></div>
            </div>

            <p style={{
              color: 'var(--text-main)',
              lineHeight: 1.6,
              fontSize: '0.96rem',
              fontFamily: 'var(--font-body)',
              fontStyle: 'normal'
            }}>
              {book.description}
            </p>
          </div>

          {/* Trust Pillars */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--tertiary-guild)" />
              <span>Independent Bookseller Verification</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="var(--accent-secondary)" />
              <span>Escrow Protected Transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Seller Marketplace Offers Matrix */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
              Marketplace Seller Listings ({listings.length})
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Compare copies across verified bookstore inventories, conditions, and prices.
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <BookOpen size={40} color="var(--text-subtle)" style={{ marginBottom: '0.75rem' }} />
            <h3>No active seller listings for this edition</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Check back soon or register as a seller to list this title in your bookstore inventory!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  background: 'var(--bg-surface)'
                }}
              >
                {/* Seller & Condition Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <Store size={26} color="var(--accent-primary)" />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {listing.sellerId?.name || 'Verified Bookseller'}
                      </strong>
                      <span className={`badge ${getConditionBadgeClass(listing.condition)}`}>
                        {listing.condition?.replace('_', ' ')}
                      </span>
                      <span className="badge badge-info">{listing.format}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {listing.descriptionNotes || 'Carefully stored, slipcased copy ready for prompt dispatch.'} • <strong style={{ color: 'var(--tertiary-guild)' }}>{listing.stockQuantity} in stock</strong>
                    </p>
                  </div>
                </div>

                {/* Price & Acquisition CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.7rem',
                      fontWeight: 700,
                      color: 'var(--accent-secondary)'
                    }}>
                      ₹{listing.price}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Taxes calculated at checkout</div>
                  </div>

                  {isSeller && !isBuyer ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <button disabled className="btn btn-secondary" style={{ opacity: 0.7, cursor: 'not-allowed', padding: '0.65rem 1.1rem', fontSize: '0.82rem' }}>
                        Seller Account
                      </button>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Sellers cannot buy items</span>
                    </div>
                  ) : !isAuthenticated ? (
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.85rem' }}>
                      Log In to Acquire
                    </Link>
                  ) : (
                    <button
                      onClick={() => addToCart(listing._id, 1)}
                      disabled={updatingId === listing._id || listing.stockQuantity <= 0}
                      className="btn btn-primary"
                      style={{ padding: '0.7rem 1.4rem' }}
                    >
                      <ShoppingBag size={17} />
                      {updatingId === listing._id ? 'Adding...' : listing.stockQuantity <= 0 ? 'Sold Out' : 'Acquire Copy'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Reviews Section */}
      <div className="responsive-two-col" style={{ gap: '2.5rem', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--accent-primary)' }}>
            Reader Appraisals & Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No reader appraisals submitted yet. Be the first verified buyer to review this work!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="glass-panel" style={{ padding: '1.35rem', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{rev.buyerId?.name || 'Verified Reader'}</strong>
                    <span className="badge badge-success"><CheckCircle2 size={12} /> Verified Purchase</span>
                  </div>
                  <RatingStars rating={rev.rating} showCount={false} />
                  <h4 style={{ margin: '0.5rem 0 0.35rem 0', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                    {rev.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <div className="glass-panel" style={{ padding: '1.75rem', background: 'var(--bg-surface)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            Submit an Appraisal
          </h3>
          {!isAuthenticated ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Please <Link to="/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}>log in</Link> to submit a review for your verified order.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Order ID (Verified Purchase)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste order reference ID"
                  required
                  value={reviewForm.orderId}
                  onChange={(e) => setReviewForm({ ...reviewForm, orderId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                >
                  <option value={5}>★★★★★ (5 - Masterpiece)</option>
                  <option value={4}>★★★★☆ (4 - Highly Recommended)</option>
                  <option value={3}>★★★☆☆ (3 - Worthwhile)</option>
                  <option value={2}>★★☆☆☆ (2 - Fair)</option>
                  <option value={1}>★☆☆☆☆ (1 - Disappointing)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Appraisal Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Superb edition & binding"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Review Notes</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Share details regarding translation, paper quality, or story..."
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>

              <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {submittingReview ? 'Submitting...' : 'Post Verified Appraisal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
