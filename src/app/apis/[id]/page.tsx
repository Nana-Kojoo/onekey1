'use client';

import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { AICodePanel } from '@/components/api/AICodePanel';
import { DetailSidebar } from '@/components/api/DetailSidebar';
import { Stars } from '@/components/ui/Stars';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Toast } from '@/components/ui/Toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import { APIS, CATEGORIES } from '@/lib/data';
import { getPricingBadge, getPricingLabel } from '@/lib/utils';
import type { Rating } from '@/lib/types';
import { BookOpenIcon, BookmarkFilledIcon, BookmarkIcon, CategoryIcon, ExternalLinkIcon, FlameIcon, KeyIcon, PackageIcon, SparklesIcon, WrenchIcon } from '@/components/ui/Icons';

type Tab = 'ai' | 'reference' | 'sdks' | 'reviews';

const QUICK_INSTALL_JS = (jsPkg: string) =>
  `npm install ${jsPkg}`;

const QUICK_INSTALL_PYTHON = (pyPkg: string) =>
  `pip install ${pyPkg}`;

const QUICK_ENV_TEMPLATE = (apiId: string) => {
  const key = `${apiId.toUpperCase().replace(/\W+/g, '_')}_API_KEY`;
  return `${key}=your_api_key_here`;
};

export default function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }                    = use(params);
  const api                       = APIS.find((a) => a.id === id);
  if (!api) notFound();

  const cat                       = CATEGORIES.find((c) => c.id === api.category);
  const { bookmarks, toggle }     = useBookmarks();
  const { message, toast }        = useToast();
  const isBookmarked              = bookmarks.includes(api.id);

  const [activeTab, setActiveTab]     = useState<Tab>('ai');
  const [ratings, setRatings]         = useState<Rating[]>(api.ratings);
  const [userRating, setUserRating]   = useState(0);
  const [comment, setComment]         = useState('');
  const [reviewed, setReviewed]       = useState(false);

  const sdkLangs = Array.from(new Set(api.sdks.map((sdk) => sdk.lang)));

  const handleBookmark = async () => {
    const result = await toggle(api.id);
    if (!result.ok) {
      toast(result.error ?? 'Unable to update saved APIs.');
      return;
    }

    toast(result.added ? 'Saved!' : 'Removed from saved');
  };

  const submitReview = () => {
    if (!userRating) return;
    setRatings((prev) => [{ user: 'you', rating: userRating, comment, date: new Date().toISOString().split('T')[0] }, ...prev]);
    setReviewed(true);
    toast('Review submitted!');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ai',        label: 'AI Code Generator'           },
    { id: 'reference', label: 'Quick Reference'             },
    { id: 'sdks',      label: 'SDKs'                        },
    { id: 'reviews',   label: `Reviews (${ratings.length})` },
  ];

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <>
        {/* Header */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '22px 0' }}>
          <div className="container">
            <div className="breadcrumb">
              <Link href="/" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Home</Link>
              <span className="bc-sep">/</span>
              <Link href="/directory" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Directory</Link>
              <span className="bc-sep">/</span>
              <span>{api.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>
                    {api.name}
                  </h1>
                  {api.trending && <span className="trending-pill" style={{ gap: 4 }}><FlameIcon size={12} /> Trending</span>}
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span className="badge badge-gray" style={{ gap: 5 }}>
                    {cat && <CategoryIcon categoryId={cat.id} size={12} />}
                    {cat?.name}
                  </span>
                  <span className={`badge ${getPricingBadge(api.pricing)}`}>{getPricingLabel(api.pricing)}</span>
                  <span className="badge badge-gray" style={{ gap: 5 }}><KeyIcon size={12} /> {api.authType}</span>
                  <span className="badge badge-dark">{api.pkg.js}</span>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 600, lineHeight: 1.6 }}>{api.longDesc}</p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className={`btn ${isBookmarked ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => void handleBookmark()}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {isBookmarked ? <BookmarkFilledIcon size={14} /> : <BookmarkIcon size={14} />}
                    {isBookmarked ? 'Saved' : 'Save'}
                  </span>
                </button>
                <a href={api.docsUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <BookOpenIcon size={14} /> Official Docs <ExternalLinkIcon size={12} />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="container page" style={{ paddingTop: 28 }}>
          <div className="detail-layout">
            {/* Main column */}
            <div>
              <div className="tabs">
                {tabs.map(({ id: tid, label }) => (
                  <button key={tid} className={`tab ${activeTab === tid ? 'active' : ''}`} onClick={() => setActiveTab(tid)}>
                    {tid === 'ai' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <SparklesIcon size={13} /> {label}
                      </span>
                    ) : label}
                  </button>
                ))}
              </div>

              {/* ── AI Code Generator ── */}
              {activeTab === 'ai' && <AICodePanel api={api} />}

              {/* ── Quick Reference ── */}
              {activeTab === 'reference' && (
                <section>
                  <div className="quickref-grid">
                    <div className="quickref-card">
                      <div className="quickref-label">Auth</div>
                      <div className="quickref-value">{api.authType}</div>
                    </div>
                    <div className="quickref-card">
                      <div className="quickref-label">Pricing</div>
                      <div className="quickref-value">{getPricingLabel(api.pricing)}</div>
                    </div>
                    <div className="quickref-card">
                      <div className="quickref-label">Category</div>
                      <div className="quickref-value">{cat?.name ?? 'General'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><PackageIcon size={12} /> JavaScript / TypeScript</div>
                    <CodeBlock code={QUICK_INSTALL_JS(api.pkg.js)} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><PackageIcon size={12} /> Python</div>
                    <CodeBlock code={QUICK_INSTALL_PYTHON(api.pkg.python)} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}><KeyIcon size={12} /> .env Template</div>
                    <CodeBlock code={QUICK_ENV_TEMPLATE(api.id)} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    <a href={api.docsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <BookOpenIcon size={14} /> Open Docs <ExternalLinkIcon size={12} />
                      </span>
                    </a>
                    <button className="btn btn-primary" onClick={() => setActiveTab('ai')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <SparklesIcon size={14} /> Generate Working Example
                      </span>
                    </button>
                  </div>

                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--text-3)' }}>
                    Switch to <strong>AI Code Generator</strong> to get working code for any task with {api.name}.
                  </div>
                </section>
              )}

              {/* ── SDKs ── */}
              {activeTab === 'sdks' && (
                <section>
                  <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                    Official SDKs &amp; Libraries
                  </h2>

                  <div className="sdk-summary-row">
                    <span className="badge badge-gray">{api.sdks.length} SDKs</span>
                    <span className="badge badge-gray">{sdkLangs.length || 1} Languages</span>
                    {sdkLangs.slice(0, 4).map((lang) => (
                      <span key={lang} className="badge badge-blue">{lang}</span>
                    ))}
                  </div>

                  {api.sdks.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14 }}>
                      No official SDKs listed yet. Use the install references below and generate a tested starter in the AI tab.
                    </div>
                  ) : (
                    <div className="sdk-grid-enhanced">
                      {api.sdks.map((sdk) => (
                        <a key={sdk.name} href={sdk.url} target="_blank" rel="noreferrer" className="sdk-chip sdk-chip-rich">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <WrenchIcon size={13} />
                            <span>{sdk.name}</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-gray">{sdk.lang}</span>
                            <ExternalLinkIcon size={12} />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                  <hr className="divider" />
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', marginBottom: 10 }}>
                      JavaScript / TypeScript
                    </div>
                    <CodeBlock code={QUICK_INSTALL_JS(api.pkg.js)} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', marginBottom: 10 }}>
                      Python
                    </div>
                    <CodeBlock code={QUICK_INSTALL_PYTHON(api.pkg.python)} />
                  </div>
                </section>
              )}

              {/* ── Reviews ── */}
              {activeTab === 'reviews' && (
                <section>
                  {/* Rating summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: 20, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--rl)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--display)', fontSize: 42, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
                        {api.rating}
                      </div>
                      <Stars rating={api.rating} />
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--mono)' }}>
                        {api.ratingCount.toLocaleString()} reviews
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map((s) => {
                        const pct = s === 5 ? 70 : s === 4 ? 20 : s === 3 ? 6 : 2;
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', width: 10 }}>{s}</span>
                            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit review */}
                  {!reviewed && (
                    <div style={{ padding: 20, border: '1px solid var(--border)', borderRadius: 'var(--rl)', marginBottom: 20 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Leave a review</div>
                      <Stars rating={userRating} interactive onRate={setUserRating} />
                      <textarea
                        className="input"
                        style={{ marginTop: 12, marginBottom: 12 }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this API…"
                      />
                      <button className="btn btn-primary" onClick={submitReview} disabled={!userRating}>
                        Submit Review
                      </button>
                    </div>
                  )}

                  {/* Comment list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ratings.map((r, i) => (
                      <div key={i} className="comment-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)' }}>
                            {r.user[0].toUpperCase()}
                          </div>
                          <strong style={{ fontSize: 13 }}>{r.user}</strong>
                          <Stars rating={r.rating} />
                        </div>
                        {r.comment && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{r.comment}</p>}
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--mono)' }}>{r.date}</div>
                      </div>
                    ))}
                    {ratings.length === 0 && (
                      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No reviews yet. Be the first!</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <DetailSidebar api={api} />
          </div>
        </div>
        </>
      </main>

      <Footer />
      {message && <Toast message={message} onDone={() => {}} />}
    </>
  );
}
