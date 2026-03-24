'use client';

import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function SignUpPage() {
  const { bookmarks } = useBookmarks();

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <section className="submit-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Home</Link>
              <span className="bc-sep">/</span>
              <span>Sign up</span>
            </div>
            <p className="directory-kicker">Authentication</p>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 8 }}>
              Sign up removed
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 680, lineHeight: 1.7 }}>
              Account creation is no longer required for this project.
            </p>
          </div>
        </section>

        <div className="container page" style={{ maxWidth: 620 }}>
          <div className="submit-card">
            <div style={{ display: 'grid', gap: 14 }}>
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
                This route is kept only for compatibility.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/account" className="btn btn-primary">Open account page</Link>
                <Link href="/directory" className="btn btn-secondary">Browse directory</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
