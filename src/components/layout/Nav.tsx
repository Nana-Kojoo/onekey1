'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookmarkIcon } from '@/components/ui/Icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { WaitlistPopup } from '@/components/ui/WaitlistPopup';

interface NavProps {
  bookmarkCount: number;
}

const LINKS = [
  { href: '/',           label: 'Home'       },
  { href: '/directory',  label: 'Directory'  },
  { href: '/categories', label: 'Categories' },
  { href: '/submit',     label: 'Submit API' },
];

export function Nav({ bookmarkCount }: NavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <div className="nav-brand-wrap">
            <Link href="/" className="logo">
              <span className="logo-dot" />
              OneKey
            </Link>
            <span className="nav-beta">Beta</span>
          </div>

          <div className="nav-links-shell">
            <div className="nav-links">
              {LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${isActive(href) ? 'active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-actions">
            <ThemeToggle />
            <Link href="/bookmarks" className="btn btn-ghost btn-sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <BookmarkIcon size={13} />
                Saved
              </span>
              {bookmarkCount > 0 && (
                <span className="nav-count">{bookmarkCount}</span>
              )}
            </Link>
            <Link href="/submit" className="btn btn-primary btn-sm nav-submit-btn">
              + Add API
            </Link>
          </div>
        </div>
      </nav>
      <WaitlistPopup />
    </>
  );
}
