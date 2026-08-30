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
    <div className="point-rating-wrapper" role="radiogroup" aria-label={name}>
      <div className="point-rating-input">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
          <button
            key={point}
            type="button"
            className={`point-btn ${point <= displayValue ? 'active' : ''}`}
            onClick={() => !disabled && onChange(point)}
            onMouseEnter={() => !disabled && setHoverValue(point)}
            onMouseLeave={() => setHoverValue(0)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange(Math.min(10, (value || 0) + 1));
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange(Math.max(1, (value || 2) - 1));
              }
            }}
            role="radio"
            aria-checked={point === value}
            aria-label={`${point} out of 10 points - ${RATING_LABELS[point]}`}
            tabIndex={point === value || (!value && point === 1) ? 0 : -1}
            disabled={disabled}
          >
            <span style={{ fontSize: '0.7rem', marginRight: '2px', opacity: 0.85 }}>★</span>
            {point}
          </button>
        ))}
      </div>
      {label && (
        <div className="star-label-badge" aria-live="polite">
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * Static rating display (non-interactive, out of 10 points)
 */
export function StarDisplay({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <span className="star-display" aria-label={`${value} out of ${max} points`}>
      {value.toFixed(1)} / {max} ⭐
    </span>
  );
}
