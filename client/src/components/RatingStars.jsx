import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count = 0, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        size={14}
        fill={i <= fullStars ? '#f59e0b' : 'none'}
        color={i <= fullStars ? '#f59e0b' : '#6b7280'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
      {showCount && count > 0 && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};
