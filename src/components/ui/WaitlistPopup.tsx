'use client';

import { useEffect, useMemo, useState } from 'react';

const POPUP_SEEN_KEY = 'onekey:waitlist-popup-seen';
const WAITLIST_JOINED_KEY = 'onekey:waitlist-joined';

export function WaitlistPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const delayMs = useMemo(() => {
    const min = 7000;
    const max = 18000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadySeen = window.localStorage.getItem(POPUP_SEEN_KEY) === '1';
    const alreadyJoined = window.localStorage.getItem(WAITLIST_JOINED_KEY) === '1';
    if (alreadySeen || alreadyJoined) return;

    const shouldShow = Math.random() >= 0.35;
    if (!shouldShow) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(POPUP_SEEN_KEY, '1');
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  const close = () => {
    setOpen(false);
  };

  const onSubmit = async () => {
    const value = email.trim();
    if (!value) {
      setMessage('Enter an email address.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/beta-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? 'Unable to join waitlist.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(WAITLIST_JOINED_KEY, '1');
      }

      setMessage('Thanks. You are on the waitlist.');
      setEmail('');
      window.setTimeout(() => setOpen(false), 900);
    } catch {
      setMessage('Unable to join waitlist.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="waitlist-overlay" role="dialog" aria-modal="true" aria-label="Join beta waitlist">
      <div className="waitlist-popup">
        <div className="waitlist-glow" />
        <button className="waitlist-close" onClick={close} aria-label="Close">×</button>
        <p className="section-kicker" style={{ marginBottom: 8 }}>Beta waitlist</p>
        <h3 className="waitlist-title">Get updates when OneKey leaves beta</h3>
        <p className="waitlist-copy">
          Join with your email and we’ll notify you when the stable version is released.
        </p>
        <div className="waitlist-tags">
          <span className="waitlist-tag">Early access notes</span>
          <span className="waitlist-tag">Launch day announcement</span>
          <span className="waitlist-tag">No spam</span>
        </div>
        <div className="waitlist-form">
          <input
            className="input"
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void onSubmit(); }}
          />
          <button className="btn btn-primary" onClick={() => void onSubmit()} disabled={submitting}>
            {submitting ? 'Joining…' : 'Join waitlist'}
          </button>
        </div>
        {message && <p className="waitlist-message">{message}</p>}
      </div>
    </div>
  );
}
