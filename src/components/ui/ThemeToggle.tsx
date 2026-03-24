'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@/components/ui/Icons';

type Theme = 'light' | 'dark';
const THEME_KEY = 'onekey:theme';
const THEME_EVENT = 'onekey:theme-changed';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = getInitialTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
    setReady(true);

    const syncFromStorage = () => {
      const current = getInitialTheme();
      setTheme(current);
      document.documentElement.dataset.theme = current;
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(THEME_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(THEME_EVENT, syncFromStorage);
    };
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(THEME_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      className="btn btn-ghost btn-sm theme-toggle"
      onClick={toggle}
      aria-label={ready ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      title={ready ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      type="button"
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {theme === 'dark' ? <SunIcon size={13} /> : <MoonIcon size={13} />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
