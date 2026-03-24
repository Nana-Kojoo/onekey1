import type { Api, SortOption, DifficultyFilter, PricingFilter } from './types';

export function getDifficulty(score: number): { label: string; color: string } {
  if (score <= 3) return { label: 'Easy',   color: '#16a34a' };
  if (score <= 6) return { label: 'Medium', color: '#d97706' };
  return              { label: 'Hard',   color: '#dc2626' };
}

export function getPricingBadge(pricing: string): string {
  if (pricing === 'free')     return 'badge-green';
  if (pricing === 'freemium') return 'badge-blue';
  return 'badge-gray';
}

export function getPricingLabel(pricing: string): string {
  if (pricing === 'free')        return 'Free';
  if (pricing === 'freemium')    return 'Freemium';
  if (pricing === 'pay-per-use') return 'Pay-per-use';
  return pricing;
}

export function trendScore(api: Api): number {
  return api.views * 0.001 + api.rating * 10 + api.ratingCount * 0.05;
}

export function filterAndSort(
  apis: Api[],
  {
    query,
    category,
    difficulty,
    pricing,
    sort,
  }: {
    query: string;
    category: string;
    difficulty: DifficultyFilter;
    pricing: PricingFilter;
    sort: SortOption;
  }
): Api[] {
  let result = [...apis];

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.pkg?.js?.toLowerCase().includes(q)
    );
  }

  if (category !== 'all') result = result.filter((a) => a.category === category);

  if (difficulty === 'easy')   result = result.filter((a) => a.difficulty <= 3);
  if (difficulty === 'medium') result = result.filter((a) => a.difficulty > 3 && a.difficulty <= 6);
  if (difficulty === 'hard')   result = result.filter((a) => a.difficulty > 6);

  if (pricing !== 'all') result = result.filter((a) => a.pricing === pricing);

  if (sort === 'trending')   result.sort((a, b) => trendScore(b) - trendScore(a));
  if (sort === 'rating')     result.sort((a, b) => b.rating - a.rating);
  if (sort === 'name')       result.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'difficulty') result.sort((a, b) => a.difficulty - b.difficulty);

  return result;
}

/** Minimal syntax highlighter — returns HTML string */
export function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\/[^\n]*)/g, '<span class="cc">$1</span>')
    .replace(/(#[^\n]+)/g, '<span class="cc">$1</span>')
    .replace(
      /\b(const|let|var|import|from|require|export|default|await|async|return|if|else|for|of|in|function|class|new|this|true|false|null|undefined|try|catch|throw)\b/g,
      '<span class="ck">$1</span>'
    )
    .replace(
      /\b(def|import|from|as|with|print|for|in|if|else|return|class|self|None|True|False|and|or|not|raise|pass)\b/g,
      '<span class="ck">$1</span>'
    )
    .replace(/(`[^`]*`|'[^']*'|"[^"]*")/g, '<span class="cs">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="cn">$1</span>');
}
