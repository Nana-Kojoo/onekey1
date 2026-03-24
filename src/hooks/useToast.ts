'use client';

import { useState, useCallback } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const toast = useCallback((msg: string, duration = 2400) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);

  return { message, toast };
}
