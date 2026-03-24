'use client';

import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { ApiCard } from '@/components/api/ApiCard';
import { Toast } from '@/components/ui/Toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import { APIS } from '@/lib/data';
import { BookmarkIcon } from '@/components/ui/Icons';

export default function BookmarksPage() {
  const { bookmarks, toggle, loading } = useBookmarks();
  const { message, toast }    = useToast();
  const saved                 = APIS.filter((a) => bookmarks.includes(a.id));
  const visibleSaved          = saved;

  const handleBookmark = async (id: string) => {
    const result = await toggle(id);
    if (!result.ok) {
      toast(result.error ?? 'Unable to update saved APIs.');
      return;
    }
    toast('Removed from saved');
  };

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 4 }}>
              Saved APIs
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              {visibleSaved.length} saved
            </p>
          </div>
        </div>

        <div className="container page">
          {loading ? (
            <div className="empty-state">
              <strong>Loading saved APIs…</strong>
            </div>
          ) : visibleSaved.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 40, opacity: 0.3, display: 'inline-flex' }}><BookmarkIcon size={40} /></span>
              <strong>No saved APIs yet</strong>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                Bookmark APIs from the directory to access them quickly.
              </span>
              <Link href="/directory" className="btn btn-primary" style={{ marginTop: 8 }}>
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="g3">
              {visibleSaved.map((api) => (
                <ApiCard key={api.id} api={api} bookmarked={true} onBookmark={handleBookmark} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      {message && <Toast message={message} onDone={() => {}} />}
    </>
  );
}
