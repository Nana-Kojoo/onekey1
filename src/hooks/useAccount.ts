'use client';

interface AuthResult { ok: boolean; error?: string }

export function useAccount() {
  const user = null;
  const loading = false;
  const refresh = async () => {};
  const signIn = async (): Promise<AuthResult> => ({ ok: false, error: 'Authentication is disabled.' });
  const signUp = async (): Promise<AuthResult> => ({ ok: false, error: 'Authentication is disabled.' });
  const signOut = async () => {};

  return {
    user,
    accountName: null,
    isSignedIn: false,
    loading,
    refresh,
    signIn,
    signUp,
    signOut,
  };
}
