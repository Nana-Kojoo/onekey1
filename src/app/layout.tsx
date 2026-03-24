import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'OneKey — Universal API Directory', template: '%s | OneKey' },
  description: 'OneKey is a production-ready application that helps developers discover, evaluate, and integrate APIs with AI-assisted code examples, SDK links, difficulty scores, and community reviews.',
  keywords: ['API', 'developer tools', 'SDK', 'REST API', 'API directory'],
  openGraph: {
    title: 'OneKey — Universal API Directory',
    description: 'Built by Flux. Discover the APIs developers actually use.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const key = 'onekey:theme';
                const saved = localStorage.getItem(key);
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light');
                document.documentElement.dataset.theme = theme;
              } catch {}
            })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
