import type { Api } from '@/lib/types';
import { CATEGORIES } from '@/lib/data';
import { getDifficulty, getPricingLabel } from '@/lib/utils';
import { DiffBar } from '@/components/ui/DiffBar';
import { CategoryIcon } from '@/components/ui/Icons';

interface DetailSidebarProps {
  api: Api;
}

export function DetailSidebar({ api }: DetailSidebarProps) {
  const cat = CATEGORIES.find((c) => c.id === api.category);
  const { label, color } = getDifficulty(api.difficulty);

  const rows = [
    { label: 'Pricing',  value: getPricingLabel(api.pricing) },
    { label: 'Auth',     value: api.authType                 },
    { label: 'npm/pip',  value: api.pkg.js                   },
    { label: 'Views',    value: api.views.toLocaleString()   },
  ];

  const factors = [
    { label: 'Docs quality',   score: Math.round(10 - api.difficulty * 0.25) },
    { label: 'Auth complexity',score: Math.round(api.difficulty * 0.9)        },
    { label: 'SDK support',    score: api.sdks.length > 2 ? 9 : api.sdks.length > 0 ? 6 : 3 },
  ];

  return (
    <aside>
      {/* Details card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: 20, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', marginBottom: 14 }}>
          API Details
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Category</span>
          <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--mono)', maxWidth: 140, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {cat && <CategoryIcon categoryId={cat.id} size={12} />}
            {cat?.name}
          </span>
        </div>
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 9, marginBottom: 9, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--mono)', maxWidth: 140, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.value}
            </span>
          </div>
        ))}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Difficulty</span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)', color }}>
              {label} {api.difficulty}/10
            </span>
          </div>
          <DiffBar score={api.difficulty} />
        </div>
      </div>

      {/* Difficulty factors */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', marginBottom: 12 }}>
          Difficulty Factors
        </div>
        {factors.map((f) => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{f.label}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>{f.score}/10</span>
            </div>
            <DiffBar score={f.score} />
          </div>
        ))}
      </div>
    </aside>
  );
}
