'use client';

import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function AccountPage() {
  const { bookmarks, loading } = useBookmarks();

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <section className="submit-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Home</Link>
              <span className="bc-sep">/</span>
              <span>Account</span>
            </div>
            <p className="directory-kicker">Account</p>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 8 }}>
              Local preferences
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 680, lineHeight: 1.7 }}>
              Authentication has been removed. Your saved APIs are stored locally in this browser.
            </p>
          </div>
        </section>

        <div className="container page" style={{ maxWidth: 720 }}>
          <div className="submit-card">
            {loading ? (
              <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Loading preferences…</p>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <p className="section-kicker" style={{ marginBottom: 6 }}>Storage</p>
                  <h2 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700 }}>Saved APIs: {bookmarks.length}</h2>
                </div>
                <div style={{ display: 'grid', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
                  <p>No sign in is required.</p>
                  <p>Your saved list is available only on this device/browser.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href="/directory" className="btn btn-secondary">Go to Directory</Link>
                  <Link href="/bookmarks" className="btn btn-ghost">Open saved APIs</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
