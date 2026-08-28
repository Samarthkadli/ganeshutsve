'use client';

import { useState } from 'react';
import { RATING_LABELS } from '@/lib/config';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  name: string;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, name, disabled = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;
  const label = displayValue ? RATING_LABELS[displayValue] : '';

  return (
    <div className="star-rating-input" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= displayValue ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              onChange(Math.min(5, (value || 0) + 1));
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              onChange(Math.max(1, (value || 2) - 1));
            }
          }}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? 's' : ''} - ${RATING_LABELS[star]}`}
          tabIndex={star === value || (!value && star === 1) ? 0 : -1}
          disabled={disabled}
        >
          ★
        </button>
      ))}
      {label && (
        <span className="star-label" aria-live="polite">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Static star display (non-interactive)
 */
export function StarDisplay({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="star-display" aria-label={`${value} out of ${max} stars`}>
      {value.toFixed(2)} ⭐
    </span>
  );
}
