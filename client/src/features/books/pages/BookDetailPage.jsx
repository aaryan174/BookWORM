import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookDetails } from '../hooks/useBookDetails.js';
import { useCart } from '../../cart/hooks/useCart.js';
import { useReviews } from '../../reviews/hooks/useReviews.js';
import { useAuthContext } from '../../auth/context/AuthContext.jsx';
import { RatingStars } from '../../../components/RatingStars.jsx';
import { ShoppingCart, Store, ShieldCheck, Tag, CheckCircle2 } from 'lucide-react';

export const BookDetailPage = () => {
  const { id } = useParams();
  const { book, listings, loading, error } = useBookDetails(id);
  const { addToCart, updatingId } = useCart();
  const { reviews, submitReview, submitting: submittingReview } = useReviews(id);
  const { isAuthenticated } = useAuthContext();

  const [reviewForm, setReviewForm] = useState({ orderId: '', rating: 5, title: '', comment: '' });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h2>Book Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{error || 'The requested book does not exist.'}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Catalog</Link>
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
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Book Master Header */}
      <div className="glass-panel" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '320px', background: '#1f2937' }}>
          <img src={book.coverImageUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div>
          <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>{book.category}</span>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{book.title}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            By <strong style={{ color: '#fff' }}>{book.authors.join(', ')}</strong>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <RatingStars rating={book.averageRating} count={book.reviewCount} />
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>ISBN-13: {book.isbn13}</span>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>Publisher: {book.publisher}</span>
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            {book.description}
          </p>
        </div>
      </div>

      {/* Multi-Seller Marketplace Listings */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>Available Seller Listings ({listings.length})</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Multiple sellers offering competitive prices & conditions</span>
        </div>

        {listings.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>There are currently no active seller listings for this book.</p>
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
                  gap: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Store size={28} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{listing.sellerId?.name || 'Verified Seller'}</strong>
                      <span className="badge badge-success"><ShieldCheck size={12} /> Verified Seller</span>
                      <span className="badge badge-info">{listing.condition}</span>
                      <span className="badge badge-warning">{listing.format}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {listing.descriptionNotes || 'Pristine copy ready for immediate dispatch.'} • <strong>{listing.stockQuantity} in stock</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                      ₹{listing.price}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Includes Taxes</div>
                  </div>

                  <button
                    onClick={() => addToCart(listing._id, 1)}
                    disabled={updatingId === listing._id || !isAuthenticated}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <ShoppingCart size={18} />
                    {updatingId === listing._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Customer Reviews Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customer reviews yet. Be the first verified buyer to rate this book!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{rev.buyerId?.name || 'Verified Reader'}</strong>
                    <span className="badge badge-success"><CheckCircle2 size={12} /> Verified Purchase</span>
                  </div>
                  <RatingStars rating={rev.rating} showCount={false} />
                  <h4 style={{ margin: '0.5rem 0 0.35rem 0', fontSize: '1rem' }}>{rev.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Form (Verified Buyers) */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Write a Review</h3>
            {!isAuthenticated ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Please <Link to="/login" style={{ color: '#6366f1', textDecoration: 'underline' }}>log in</Link> to submit a review for your verified purchase.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Order ID (Verified Purchase)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your Order Mongo ID"
                    required
                    value={reviewForm.orderId}
                    onChange={(e) => setReviewForm({ ...reviewForm, orderId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <select
                    className="form-select"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value, 10) })}
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Masterpiece on Software Architecture"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Review Details</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Share details of your reading experience..."
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
