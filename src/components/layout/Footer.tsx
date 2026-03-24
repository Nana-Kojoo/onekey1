import Link from 'next/link';
import { APIS, CATEGORIES } from '@/lib/data';
import { CategoryIcon } from '@/components/ui/Icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const LINKS = ['/', '/directory', '/categories', '/submit'];
const LABELS: Record<string, string> = {
  '/': 'Home', '/directory': 'Directory',
  '/categories': 'Categories', '/submit': 'Submit',
};

const EXTRA_LINKS = [
  { href: '/bookmarks', label: 'Saved APIs' },
  { href: '/directory?sort=rating', label: 'Top rated' },
  { href: '/directory?sort=trending', label: 'Trending now' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">OneKey by Flux</div>
            <p className="footer-copy">
              Built by Flux, a software development startup. Discover, evaluate, and integrate APIs with real implementation context, not just docs links.
            </p>
            <div className="footer-stats">
              <span className="badge badge-gray" style={{ gap: 5 }}>
                <CategoryIcon categoryId="data" size={12} />
                {APIS.length} APIs indexed
              </span>
              <span className="badge badge-gray">{CATEGORIES.length} categories</span>
            </div>
          </div>

          <div>
            <div className="footer-title">Explore</div>
            <div className="footer-links">
              {LINKS.map((href) => (
                <Link key={href} href={href} className="footer-link">
                  {LABELS[href]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-title">Shortcuts</div>
            <div className="footer-links">
              {EXTRA_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="footer-link">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Flux — OneKey</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>Powered by Flux</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
