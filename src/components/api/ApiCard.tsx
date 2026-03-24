'use client';

import Link from 'next/link';
import type { Api } from '@/lib/types';
import { CATEGORIES } from '@/lib/data';
import { getDifficulty, getPricingBadge, getPricingLabel } from '@/lib/utils';
import { Stars } from '@/components/ui/Stars';
import { DiffBar } from '@/components/ui/DiffBar';
import { BookmarkFilledIcon, BookmarkIcon, CategoryIcon, FlameIcon, KeyIcon } from '@/components/ui/Icons';

interface ApiCardProps {
  api: Api;
  bookmarked: boolean;
  onBookmark: (id: string, pricing: Api['pricing']) => void | Promise<void>;
}

export function ApiCard({ api, bookmarked, onBookmark }: ApiCardProps) {
  const cat = CATEGORIES.find((c) => c.id === api.category);
  const { label, color } = getDifficulty(api.difficulty);

  return (
    <div className="api-card" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Link
              href={`/apis/${api.id}`}
              style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, textDecoration: 'none', color: 'var(--text)' }}
            >
              {api.name}
            </Link>
            {api.trending && <span className="trending-pill"><FlameIcon size={12} /></span>}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span className="badge badge-gray" style={{ gap: 5 }}>
              {cat && <CategoryIcon categoryId={cat.id} size={12} />}
              {cat?.name}
            </span>
            <span className={`badge ${getPricingBadge(api.pricing)}`}>{getPricingLabel(api.pricing)}</span>
            <span className="badge badge-dark">{api.pkg.js}</span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.preventDefault(); onBookmark(api.id, api.pricing); }}
          style={{ fontSize: 15, padding: '4px 6px' }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {bookmarked ? <BookmarkFilledIcon size={15} /> : <BookmarkIcon size={15} />}
        </button>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {api.description}
      </p>

      {/* Rating + Difficulty */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={api.rating} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
              {api.rating} ({api.ratingCount.toLocaleString()})
            </span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <KeyIcon size={11} /> {api.authType}
            </span>
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>DIFFICULTY</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color }}>{label}</span>
          </div>
          <DiffBar score={api.difficulty} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
          {api.sdks.length} SDK{api.sdks.length !== 1 ? 's' : ''} · {api.views.toLocaleString()} views
        </span>
        <Link href={`/apis/${api.id}`} style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>→</Link>
      </div>
    </div>
  );
}
