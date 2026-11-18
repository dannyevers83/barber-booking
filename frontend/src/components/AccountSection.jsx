// ─── Imports ─────────────────────────────────────────────────────────

import { useState } from 'react';

import AuthForm from './AuthForm';
import { authClient } from '@/lib/authClient';

// ─── Account section component ───────────────────────────────────────

function AccountSection() {
  // ─── Authentication session ────────────────────────────────────────

  const {
    data: session,
    isPending: isLoadingSession,
    error: sessionError,
  } = authClient.useSession();

  // ─── Sign-out state ────────────────────────────────────────────────

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  // ─── Sign-out handler ──────────────────────────────────────────────

  async function handleSignOut() {
    setSignOutError('');
    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setSignOutError(error.message || 'Unable to sign out.');
      }
    } catch {
      setSignOutError('Unable to connect. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  // ─── Account layout ────────────────────────────────────────────────

  return (
    <section className="mt-6" aria-label="Account">
      {isLoadingSession && <p role="status">Checking your session...</p>}

      {!isLoadingSession && sessionError && (
        <p role="alert" className="text-destructive">
          Unable to check your session. Please try again later.
        </p>
      )}

      {!isLoadingSession &&
        !sessionError &&
        (session ? (
          <div>
            <p>Welcome, {session.user.name}</p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-3 rounded-lg border border-input px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>

            {signOutError && (
              <p role="alert" className="mt-2 text-destructive">
                {signOutError}
              </p>
            )}
          </div>
        ) : (
          <AuthForm />
        ))}
    </section>
  );
}

export default AccountSection;
