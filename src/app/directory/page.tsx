'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { ApiCard } from '@/components/api/ApiCard';
import { Toast } from '@/components/ui/Toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import { APIS, CATEGORIES } from '@/lib/data';
import { filterAndSort } from '@/lib/utils';
import type { SortOption, DifficultyFilter, PricingFilter } from '@/lib/types';
import { CategoryIcon, SearchIcon } from '@/components/ui/Icons';

const PAGE_SIZE = 9;

export default function DirectoryPage() {
  const searchParams            = useSearchParams();
  const { bookmarks, toggle }   = useBookmarks();
  const { message, toast }      = useToast();

  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [diff,     setDiff]     = useState<DifficultyFilter>('all');
  const [pricing,  setPricing]  = useState<PricingFilter>('all');
  const [sort,     setSort]     = useState<SortOption>('trending');
  const [page,     setPage]     = useState(1);

  // Sync category from URL param on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(
    () => filterAndSort(APIS, { query, category, difficulty: diff, pricing, sort }),
    [query, category, diff, pricing, sort]
  );

  const selectedCategory = CATEGORIES.find((c) => c.id === category);
  const topCategories = useMemo(
    () =>
      CATEGORIES
        .map((c) => ({ ...c, count: APIS.filter((a) => a.category === c.id).length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
    []
  );

  const paged   = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  const handleBookmark = async (id: string) => {
    const result = await toggle(id);
    if (!result.ok) {
      toast(result.error ?? 'Unable to update saved APIs.');
      return;
    }

    toast(result.added ? 'Saved!' : 'Removed from saved');
  };

  const clearFilters = () => {
    setQuery(''); setCategory('all'); setDiff('all'); setPricing('all'); setPage(1);
  };

  const hasActiveFilters = category !== 'all' || diff !== 'all' || pricing !== 'all' || query;
  const activeFilterChips = [
    query ? `Query: ${query}` : null,
    category !== 'all' ? `Category: ${selectedCategory?.name ?? category}` : null,
    pricing !== 'all' ? `Pricing: ${pricing}` : null,
    diff !== 'all' ? `Difficulty: ${diff}` : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <section className="directory-hero">
          <div className="container">
            <p className="directory-kicker">API Discovery Workspace</p>
            <h1 className="directory-title">Find the right API faster</h1>
            <p className="directory-copy">
              Filter by category, pricing, and integration complexity. Compare options quickly and save your best picks.
            </p>

            <div className="directory-meta-row">
              <span className="badge badge-gray">{APIS.length} APIs indexed</span>
              <span className="badge badge-gray">{CATEGORIES.length} categories</span>
              {selectedCategory && (
                <span className="badge badge-dark" style={{ gap: 6 }}>
                  <CategoryIcon categoryId={selectedCategory.id} size={12} />
                  {selectedCategory.name}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="directory-filter-wrap">
          <div className="container">
            <div className="directory-filter-panel">
              <div className="directory-filter-row">
                <div style={{ flex: 1, minWidth: 260 }}>
                  <label className="label" style={{ marginBottom: 6 }}>Search</label>
                  <div className="search-wrap">
                    <span className="search-icon"><SearchIcon size={15} /></span>
                    <input
                      className="search-input"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                      placeholder="Search by name, npm package, category…"
                    />
                  </div>
                </div>

                <div className="directory-select-grid">
                  <div>
                    <label className="label" style={{ marginBottom: 6 }}>Sort</label>
                    <select className="input directory-select" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                      <option value="trending">Trending</option>
                      <option value="rating">Top Rated</option>
                      <option value="name">A–Z</option>
                      <option value="difficulty">Easiest</option>
                    </select>
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: 6 }}>Pricing</label>
                    <select className="input directory-select" value={pricing} onChange={(e) => { setPricing(e.target.value as PricingFilter); setPage(1); }}>
                      <option value="all">All Pricing</option>
                      <option value="free">Free</option>
                      <option value="freemium">Freemium</option>
                      <option value="pay-per-use">Pay-per-use</option>
                    </select>
                  </div>

                  <div>
                    <label className="label" style={{ marginBottom: 6 }}>Difficulty</label>
                    <select className="input directory-select" value={diff} onChange={(e) => { setDiff(e.target.value as DifficultyFilter); setPage(1); }}>
                      <option value="all">Any Difficulty</option>
                      <option value="easy">Easy (1–3)</option>
                      <option value="medium">Medium (4–6)</option>
                      <option value="hard">Hard (7–10)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="chip-row" style={{ marginTop: 14 }}>
                <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => { setCategory('all'); setPage(1); }}>
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    className={`chip ${category === c.id ? 'active' : ''}`}
                    onClick={() => { setCategory(category === c.id ? 'all' : c.id); setPage(1); }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CategoryIcon categoryId={c.id} size={13} /> {c.name}
                    </span>
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <div className="active-filter-row">
                  {activeFilterChips.map((chip) => (
                    <span key={chip} className="active-filter-chip">{chip}</span>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container page">
          <div className="directory-toolbar">
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>
                Showing {paged.length} of {filtered.length} API{filtered.length !== 1 ? 's' : ''}
              </div>
              {selectedCategory && (
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-2)' }}>
                  {selectedCategory.desc}
                </div>
              )}
            </div>

            <div className="directory-top-cats">
              {topCategories.map((c) => (
                <button key={c.id} className="chip" onClick={() => { setCategory(c.id); setPage(1); }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CategoryIcon categoryId={c.id} size={12} /> {c.name} ({c.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 40, opacity: 0.3, display: 'inline-flex' }}><SearchIcon size={40} /></span>
              <strong>No APIs found</strong>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Try adjusting filters or search terms.</span>
            </div>
          ) : (
            <>
              <div className="g3">
                {paged.map((api) => (
                  <ApiCard key={api.id} api={api} bookmarked={bookmarks.includes(api.id)} onBookmark={handleBookmark} />
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <button className="btn btn-secondary" onClick={() => setPage((p) => p + 1)}>
                    Load more ({filtered.length - paged.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      {message && <Toast message={message} onDone={() => {}} />}
    </>
  );
}
