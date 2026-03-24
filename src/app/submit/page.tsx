'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/ui/Toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/useToast';
import { CATEGORIES } from '@/lib/data';
import { CheckCircleIcon, SparklesIcon } from '@/components/ui/Icons';

interface FormState {
  name: string; description: string; category: string;
  docsUrl: string; pkgJs: string; pkgPy: string;
  pricing: string; authType: string;
}

const EMPTY: FormState = {
  name: '', description: '', category: '', docsUrl: '',
  pkgJs: '', pkgPy: '', pricing: '', authType: '',
};

const GUIDELINES = [
  'API must be publicly accessible (no private/internal APIs)',
  'Must have official documentation',
  'Should be production-ready, not alpha/experimental',
  'Avoid duplicate submissions — search first',
];

const REQUIRED_KEYS: Array<keyof FormState> = ['name', 'description', 'category'];

export default function SubmitPage() {
  const { bookmarks }       = useBookmarks();
  const { message, toast }  = useToast();
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [done, setDone]     = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const completedRequired = REQUIRED_KEYS.filter((k) => form[k].trim().length > 0).length;
  const completionPct = Math.round((completedRequired / REQUIRED_KEYS.length) * 100);

  const submit = () => {
    if (!form.name || !form.description || !form.category) {
      toast('Please fill in all required fields.');
      return;
    }
    setDone(true);
    toast('Submitted! Under review.');
  };

  if (done) {
    return (
      <>
        <Nav bookmarkCount={bookmarks.length} />
        <main>
          <div className="container page" style={{ maxWidth: 620, paddingTop: 70 }}>
            <div className="submit-success-card">
              <div style={{ marginBottom: 16, display: 'inline-flex' }}><CheckCircleIcon size={52} color="var(--green)" /></div>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
                Submission received!
              </h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.7 }}>
                We&apos;ll verify the details and add it to the directory within 48 hours.
              </p>
              <div className="submit-status-row">
                <span className="badge badge-green">Queued for review</span>
                <span className="badge badge-gray">Estimated: 1–2 days</span>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22 }}>
              <Link href="/directory" className="btn btn-secondary">Browse Directory</Link>
              <button className="btn btn-primary" onClick={() => { setDone(false); setForm(EMPTY); }}>
                Submit Another
              </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav bookmarkCount={bookmarks.length} />

      <main>
        <div className="submit-hero">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Home</Link>
              <span className="bc-sep">/</span>
              <span>Submit API</span>
            </div>
            <p className="directory-kicker">Contribute</p>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 8 }}>
              Submit an API
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 680, lineHeight: 1.7 }}>
              Know a great API? Add it to the directory. Required fields first, then optional integration details.
            </p>
            <div className="submit-meta-row">
              <span className="badge badge-gray">Moderated listing</span>
              <span className="badge badge-gray">Manual quality review</span>
            </div>
          </div>
        </div>

        <div className="container page submit-layout">
          <section className="submit-card">
            <div className="submit-card-head">
              <div>
                <p className="section-kicker" style={{ marginBottom: 4 }}>Submission form</p>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: 23, fontWeight: 700 }}>API details</h2>
              </div>
              <span className="submit-progress">{completionPct}% complete</span>
            </div>

            <div className="submit-progress-track">
              <div className="submit-progress-fill" style={{ width: `${completionPct}%` }} />
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div className="g2">
                <div>
                  <label className="label">API Name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Stripe, OpenAI" />
                </div>
                <div>
                  <label className="label">Category <span style={{ color: 'var(--red)' }}>*</span></label>
                  <select className="input" value={form.category} onChange={set('category')}>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea className="input" value={form.description} onChange={set('description')} placeholder="Briefly describe what this API does…" />
              </div>

              <div className="submit-divider" />

              <div>
                <label className="label">Documentation URL</label>
                <input className="input" value={form.docsUrl} onChange={set('docsUrl')} placeholder="https://docs.example.com" />
              </div>

              <div className="g2">
                <div>
                  <label className="label">npm package</label>
                  <input className="input" value={form.pkgJs} onChange={set('pkgJs')} placeholder="e.g. stripe" />
                </div>
                <div>
                  <label className="label">pip package</label>
                  <input className="input" value={form.pkgPy} onChange={set('pkgPy')} placeholder="e.g. stripe" />
                </div>
              </div>

              <div className="g2">
                <div>
                  <label className="label">Pricing</label>
                  <select className="input" value={form.pricing} onChange={set('pricing')}>
                    <option value="">Select…</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="pay-per-use">Pay-per-use</option>
                  </select>
                </div>
                <div>
                  <label className="label">Auth Type</label>
                  <select className="input" value={form.authType} onChange={set('authType')}>
                    <option value="">Select…</option>
                    <option>API Key</option>
                    <option>OAuth 2.0</option>
                    <option>Bearer Token</option>
                    <option>JWT</option>
                    <option>None</option>
                  </select>
                </div>
              </div>

              <div className="submit-actions">
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Reviewed before publishing.</span>
                <button className="btn btn-primary" onClick={submit}>Submit API →</button>
              </div>
            </div>
          </section>

          <aside className="submit-side">
            <div className="submit-help-card">
              <div style={{ display: 'inline-flex', marginBottom: 10 }}>
                <SparklesIcon size={16} />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                Submission Guidelines
              </div>
              <ul className="submit-guidelines">
                {GUIDELINES.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="submit-help-card" style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                Tips for faster approval
              </div>
              <ul className="submit-guidelines">
                <li>Use the official docs URL.</li>
                <li>Include package names when possible.</li>
                <li>Write a clear, practical description.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      {message && <Toast message={message} onDone={() => {}} />}
    </>
  );
}
