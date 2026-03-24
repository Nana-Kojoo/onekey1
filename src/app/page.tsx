'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { ApiCard } from '@/components/api/ApiCard';
import { Stars } from '@/components/ui/Stars';
import { Toast } from '@/components/ui/Toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import { APIS, CATEGORIES } from '@/lib/data';
import { trendScore } from '@/lib/utils';
import { CategoryIcon, SearchIcon } from '@/components/ui/Icons';

const trending   = [...APIS].sort((a, b) => trendScore(b) - trendScore(a)).slice(0, 6);
const topRated   = [...APIS].sort((a, b) => b.rating - a.rating).slice(0, 4);
const starterPicks = [...APIS].sort((a, b) => a.difficulty - b.difficulty || b.rating - a.rating).slice(0, 3);
const featuredCategories = CATEGORIES
  .map((category) => ({
    ...category,
    count: APIS.filter((api) => api.category === category.id).length,
    sample: APIS.find((api) => api.category === category.id),
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 4);

const STATS = [
  { value: `${APIS.length}+`, label: 'APIs indexed'    },
  { value: CATEGORIES.length,  label: 'Categories'      },
  { value: 'Built-in',         label: 'AI code gen'     },
  { value: '99.9%',            label: 'Uptime'          },
];

const BENEFITS = [
  {
    title: 'Compare integration paths',
    body: 'See SDK package names, auth models, pricing signals, and implementation difficulty in one place.',
  },
  {
    title: 'Start with generated code',
    body: 'Jump from directory listing to AI-assisted snippets so teams ship prototypes and proofs faster.',
  },
  {
    title: 'Build a shortlist quickly',
    body: 'Bookmark candidates, review ratings, and move from discovery to decision without tab overload.',
  },
];

const WORKFLOW = [
  { step: '01', title: 'Search by use case', body: 'Find APIs by category, package name, or the product problem you need to solve.' },
  { step: '02', title: 'Evaluate fit fast', body: 'Check community rating, integration effort, and pricing model before you commit.' },
  { step: '03', title: 'Ship with confidence', body: 'Open the API detail page, generate code, and keep the best options saved for later.' },
];

export default function HomePage() {
  const router                    = useRouter();
  const { bookmarks, toggle }     = useBookmarks();
  const { message, toast }        = useToast();
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState(APIS.slice(0, 0));
  const [showDrop, setShowDrop]   = useState(false);
  const [betaEmail, setBetaEmail] = useState('');
  const [betaSubmitting, setBetaSubmitting] = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      APIS.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [query]);

  const handleBookmark = async (id: string) => {
    const result = await toggle(id);
    if (!result.ok) {
      toast(result.error ?? 'Unable to update saved APIs.');
      return;
    }

    toast(result.added ? 'Saved!' : 'Removed from saved');
  };

  const handleBetaSignup = async () => {
    const email = betaEmail.trim();
    if (!email) {
      toast('Enter an email address.');
      return;
    }

    setBetaSubmitting(true);
    try {
      const res = await fetch('/api/beta-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Unable to join beta updates.');
        return;
      }

      setBetaEmail('');
      toast(data.message ?? 'You are on the beta update list.');
    } catch {
      toast('Unable to join beta updates.');
    } finally {
      setBetaSubmitting(false);
    }
  };

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <section className="home-hero">
          <div className="container hero-grid">
            <div>
              <p className="hero-eyebrow">Universal API Directory · by Flux</p>
              <h1 className="hero-title">
                Discover APIs with the
                <br />
                context developers need.
              </h1>
              <p className="hero-copy">
                Search, compare, and shortlist APIs with ratings, package info, difficulty scores,
                and AI-assisted code examples built into the workflow.
              </p>

              <div className="hero-actions">
                <Link href="/directory" className="btn btn-primary btn-lg">Explore directory</Link>
                <Link href="/submit" className="btn btn-secondary btn-lg">Submit an API</Link>
              </div>

              <div style={{ position: 'relative', maxWidth: 620 }}>
                <div className="search-wrap">
                  <span className="search-icon" style={{ fontSize: 18 }}><SearchIcon size={16} /></span>
                  <input
                    ref={inputRef}
                    className="hero-search"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowDrop(true); }}
                    onFocus={() => setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && results.length) router.push(`/apis/${results[0].id}`); }}
                    placeholder="Search APIs… payments, AI, auth…"
                  />
                  <kbd style={{ position: 'absolute', right: 14 }}>⌘K</kbd>
                </div>

                {showDrop && results.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--rl)', boxShadow: '0 8px 32px rgba(0,0,0,.12)', zIndex: 50, overflow: 'hidden' }}>
                    {results.map((api) => {
                      const cat = CATEGORIES.find((c) => c.id === api.category);
                      return (
                        <Link key={api.id} href={`/apis/${api.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                          <span style={{ fontSize: 20, display: 'inline-flex' }}>{cat && <CategoryIcon categoryId={cat.id} size={18} />}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{api.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{api.pkg.js} · {cat?.name}</div>
                          </div>
                          <Stars rating={api.rating} />
                        </Link>
                      );
                    })}
                    <Link href="/directory"
                      style={{ display: 'block', padding: '10px 16px', fontSize: 12, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--mono)', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                      View all in directory →
                    </Link>
                  </div>
                )}
              </div>

              <div className="chip-row" style={{ marginTop: 20 }}>
                {CATEGORIES.slice(0, 6).map((c) => (
                  <Link key={c.id} href={`/directory?category=${c.id}`} className="chip">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CategoryIcon categoryId={c.id} size={13} /> {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="hero-panel">
              <div className="hero-panel-header">
                <span className="badge badge-dark">Live shortlist</span>
                <span className="hero-panel-label">Picked from trending APIs</span>
              </div>

              <div className="hero-mini-stats">
                {STATS.map((stat) => (
                  <div key={stat.label} className="hero-mini-stat">
                    <span className="hero-mini-value">{stat.value}</span>
                    <span className="hero-mini-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="hero-list">
                {trending.slice(0, 3).map((api, index) => {
                  const category = CATEGORIES.find((item) => item.id === api.category);

                  return (
                    <Link key={api.id} href={`/apis/${api.id}`} className="hero-list-item">
                      <div className="hero-list-rank">0{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div className="hero-list-title-row">
                          <span className="hero-list-title">{api.name}</span>
                          <span className="badge badge-gray" style={{ gap: 5 }}>
                            {category && <CategoryIcon categoryId={category.id} size={12} />}
                            {category?.name}
                          </span>
                        </div>
                        <p className="hero-list-copy">{api.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </div>
        </section>

        <div className="container" style={{ paddingTop: 48 }}>
          {/* Stats */}
          <div className="g4" style={{ marginBottom: 52 }}>
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-val">{s.value}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          <section style={{ marginBottom: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Why teams use it</p>
                <h2 className="section-title">A homepage that gets you to the right API faster</h2>
              </div>
            </div>
            <div className="feature-grid">
              {BENEFITS.map((item) => (
                <div key={item.title} className="feature-card">
                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-copy">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trending */}
          <section style={{ marginBottom: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Popular right now</p>
                <h2 className="section-title">Trending APIs</h2>
              </div>
              <Link href="/directory" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div className="g3">
              {trending.map((api) => (
                <ApiCard key={api.id} api={api} bookmarked={bookmarks.includes(api.id)} onBookmark={handleBookmark} />
              ))}
            </div>
          </section>

          {/* Top Rated */}
          <section style={{ marginBottom: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Easy wins</p>
                <h2 className="section-title">Starter-friendly picks</h2>
              </div>
              <Link href="/directory" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div className="g3">
              {starterPicks.map((api) => {
                const cat = CATEGORIES.find((c) => c.id === api.category);
                return (
                  <Link key={api.id} href={`/apis/${api.id}`} className="api-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{api.name}</span>
                      <span className="badge badge-gray">{cat && <CategoryIcon categoryId={cat.id} size={12} />}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{api.description}</p>
                    <Stars rating={api.rating} />
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>{api.pkg.js}</div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                      Difficulty {api.difficulty}/10 · {api.ratingCount.toLocaleString()} reviews
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section style={{ marginBottom: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Collections</p>
                <h2 className="section-title">Browse by category</h2>
              </div>
              <Link href="/categories" className="btn btn-ghost btn-sm">All categories →</Link>
            </div>
            <div className="category-grid-enhanced">
              {featuredCategories.map((cat, idx) => {
                const catApis = APIS
                  .filter((a) => a.category === cat.id)
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 2);

                return (
                  <Link key={cat.id} href={`/directory?category=${cat.id}`} className="cat-card cat-card-enhanced" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="cat-card-head">
                      <span style={{ fontSize: 26, display: 'inline-flex' }}><CategoryIcon categoryId={cat.id} size={24} /></span>
                      <span className="cat-rank">0{idx + 1}</span>
                    </div>

                    <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>{cat.name}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{cat.desc}</p>

                    <span className="cat-meta-line">
                      {cat.count} API{cat.count !== 1 ? 's' : ''}
                    </span>

                    <div className="cat-samples">
                      {catApis.map((api) => (
                        <span key={api.id} className="cat-sample-item">{api.name}</span>
                      ))}
                    </div>

                    <span className="cat-cta-line">Explore {cat.name} →</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section style={{ marginBottom: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Decision flow</p>
                <h2 className="section-title">How it works</h2>
              </div>
            </div>
            <div className="feature-grid">
              {WORKFLOW.map((item) => (
                <div key={item.step} className="workflow-card">
                  <div className="workflow-step">{item.step}</div>
                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-copy">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="cta-band">
            <div>
              <p className="section-kicker" style={{ marginBottom: 8 }}>Ready to explore?</p>
              <h2 className="section-title" style={{ marginBottom: 8 }}>Find your next API integration in minutes</h2>
              <p className="feature-copy" style={{ maxWidth: 640 }}>
                Dive into the full directory, compare top-rated options, or contribute an API your team depends on.
              </p>
            </div>
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <Link href="/directory" className="btn btn-primary btn-lg">Browse directory</Link>
              <Link href="/bookmarks" className="btn btn-secondary btn-lg">Open saved APIs</Link>
            </div>
          </section>

          <section className="beta-updates-band">
            <div className="beta-updates-copy-wrap">
              <p className="section-kicker" style={{ marginBottom: 8 }}>Beta program</p>
              <h2 className="section-title" style={{ marginBottom: 8 }}>Get notified when OneKey leaves beta</h2>
              <p className="feature-copy" style={{ maxWidth: 640 }}>
                OneKey is currently in beta. Join the list and we'll email you when stable mode launches.
              </p>
              <div className="beta-updates-points">
                <span className="beta-point">Early access notes</span>
                <span className="beta-point">Launch day announcement</span>
                <span className="beta-point">No spam</span>
              </div>
            </div>
            <div className="beta-updates-form-wrap">
              <div className="beta-updates-form">
                <input
                  className="input"
                  type="email"
                  value={betaEmail}
                  onChange={(e) => setBetaEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleBetaSignup(); }}
                />
                <button className="btn btn-primary" onClick={() => void handleBetaSignup()} disabled={betaSubmitting}>
                  {betaSubmitting ? 'Joining…' : 'Notify me'}
                </button>
              </div>
              <p className="beta-updates-note">We only email for major beta milestones.</p>
            </div>
          </section>

          <section style={{ marginTop: 52 }}>
            <div className="section-head">
              <div>
                <p className="section-kicker">Most trusted</p>
                <h2 className="section-title">Top rated APIs</h2>
              </div>
              <Link href="/directory" className="btn btn-ghost btn-sm">See leaderboard →</Link>
            </div>
            <div className="g4">
              {topRated.map((api) => {
                const cat = CATEGORIES.find((c) => c.id === api.category);
                return (
                  <Link key={api.id} href={`/apis/${api.id}`} className="api-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>{api.name}</span>
                      <span className="badge badge-gray">{cat && <CategoryIcon categoryId={cat.id} size={12} />}</span>
                    </div>
                    <Stars rating={api.rating} />
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>{api.pkg.js}</div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                      {api.rating}/5 · {api.ratingCount.toLocaleString()} reviews
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      {message && <Toast message={message} onDone={() => {}} />}
    </>
  );
}
