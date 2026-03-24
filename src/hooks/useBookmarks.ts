'use client';

import { useState, useEffect, useCallback } from 'react';

const BOOKMARK_EVENT = 'onekey:bookmarks-changed';
const STORAGE_KEY = 'onekey:bookmarks';

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setBookmarks(readBookmarks());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const handle = () => { void refresh(); };
    window.addEventListener(BOOKMARK_EVENT, handle);
    return () => {
      window.removeEventListener(BOOKMARK_EVENT, handle);
    };
  }, [refresh]);

  const toggle = useCallback(async (id: string): Promise<{ ok: true; added: boolean } | { ok: false; error: string }> => {
    try {
      const existing = readBookmarks();
      const added = !existing.includes(id);
      const next = added ? [...existing, id] : existing.filter((item) => item !== id);
      writeBookmarks(next);
      setBookmarks(next);
      window.dispatchEvent(new Event(BOOKMARK_EVENT));
      return { ok: true, added };
    } catch {
      return { ok: false, error: 'Unable to update saved APIs.' };
    }
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks]);

  return { bookmarks, toggle, isBookmarked, loading, refresh };
}
