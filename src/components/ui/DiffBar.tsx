import { getDifficulty } from '@/lib/utils';

interface DiffBarProps {
  score: number;
}

export function DiffBar({ score }: DiffBarProps) {
  const { color } = getDifficulty(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="diff-track">
        <div
          className="diff-fill"
          style={{ width: `${score * 10}%`, background: color }}
        />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)', minWidth: 32 }}>
        {score}/10
      </span>
    </div>
  );
}
