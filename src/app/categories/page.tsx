import Link from 'next/link';
import type { Metadata } from 'next';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { APIS, CATEGORIES } from '@/lib/data';
import { CategoryIcon } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'API Categories',
  description: 'Browse APIs by category — Payments, AI, Maps, Auth, Finance, and more.',
};

export default function CategoriesPage() {
  const bySize = CATEGORIES
    .map((cat) => ({
      ...cat,
      apis: APIS.filter((a) => a.category === cat.id),
    }))
    .sort((a, b) => b.apis.length - a.apis.length);

  return (
    <>
      {/* Nav needs bookmarkCount — wrap in a client shell if needed; 0 is fine for SSR */}
      <Nav bookmarkCount={0} />

      <main>
        <div className="categories-hero">
          <div className="container">
            <p className="directory-kicker">Taxonomy</p>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 6 }}>
              API Categories
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, maxWidth: 660 }}>
              {APIS.length} APIs across {CATEGORIES.length} categories.
              Explore by domain and jump directly into implementation-ready options.
            </p>
            <div className="directory-meta-row">
              <span className="badge badge-gray">Most active: {bySize[0]?.name}</span>
              <span className="badge badge-gray">Avg {Math.round(APIS.length / CATEGORIES.length)} APIs per category</span>
            </div>
          </div>
        </div>

        <div className="container page">
          <div className="category-grid-enhanced">
            {bySize.map((cat, idx) => {
              const topInCategory = [...cat.apis].sort((a, b) => b.rating - a.rating).slice(0, 3);

              return (
                <Link
                  key={cat.id}
                  href={`/directory?category=${cat.id}`}
                  className="cat-card cat-card-enhanced"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="cat-card-head">
                    <span style={{ fontSize: 28, display: 'inline-flex' }}><CategoryIcon categoryId={cat.id} size={26} /></span>
                    <span className="cat-rank">0{idx + 1}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>{cat.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{cat.desc}</span>
                  <span className="cat-meta-line">
                    {cat.apis.length} API{cat.apis.length !== 1 ? 's' : ''}
                  </span>
                  <div className="cat-samples">
                    {topInCategory.map((a) => (
                      <span key={a.id} className="cat-sample-item">{a.name}</span>
                    ))}
                  </div>
                  <span className="cat-cta-line">View {cat.name} APIs →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
