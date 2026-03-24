'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/ui/Icons';

interface StarsProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function Stars({ rating, interactive = false, onRate }: StarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? rating;

  if (interactive) {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            className="star-btn"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onRate?.(s)}
            aria-label={`Rate ${s} stars`}
          >
            {s <= display
              ? <StarIcon size={20} fill="#f59e0b" color="#f59e0b" />
              : <StarIcon size={20} color="var(--border-strong)" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'}>
          {s <= Math.round(rating)
            ? <StarIcon size={13} fill="#f59e0b" color="#f59e0b" />
            : <StarIcon size={13} color="var(--border-strong)" />}
        </span>
      ))}
    </div>
  );
}
