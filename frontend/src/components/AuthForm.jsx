// ─── Imports ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { authClient } from '@/lib/authClient';

// ─── Auth form component ─────────────────────────────────────────────

function AuthForm() {
  // ─── Form state ────────────────────────────────────────────────────

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  // ─── Submission state ──────────────────────────────────────────────

  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Authentication mode ───────────────────────────────────────────

  function toggleAuthMode() {
    setIsSignUp((current) => !current);
    setAuthError('');
    setPassword('');
  }

  // ─── Authentication submission ─────────────────────────────────────

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      const { error } = isSignUp
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
          });

      if (error) {
        setAuthError(error.message || 'Unable to complete your request.');
      }
    } catch {
      setAuthError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Form layout ───────────────────────────────────────────────────

  return (
    <section className="mt-6 rounded-xl bg-card p-6">
      <h2 className="text-xl font-semibold">
        {isSignUp ? 'Create an account' : 'Sign in'}
      </h2>
      <form onSubmit={handleAuthSubmit}>
        {/* ─── Name ─────────────────────────────────────────────── */}

        {isSignUp && (
          <>
            <label htmlFor="auth-name" className="mt-6 block font-semibold">
              Full name
            </label>

            <input
              id="auth-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background p-3"
            />
          </>
        )}

        {/* ─── Email address ────────────────────────────────────── */}

        <label htmlFor="auth-email" className="mt-6 block font-semibold">
          Email address
        </label>

        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-lg border border-input bg-background p-3"
        />

        {/* ─── Password ─────────────────────────────────────────── */}

        <label htmlFor="auth-password" className="mt-6 block font-semibold">
          Password
        </label>

        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          minLength={isSignUp ? 8 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-lg border border-input bg-background p-3"
        />

        {/* ─── Authentication error ─────────────────────────────── */}

        {authError && (
          <p role="alert" className="mt-4 text-destructive">
            {authError}
          </p>
        )}

        {/* ─── Submit authentication ────────────────────────────── */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
        >
          {isSubmitting
            ? 'Please wait...'
            : isSignUp
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      {/* ─── Switch authentication mode ───────────────────────── */}

      <button
        type="button"
        onClick={toggleAuthMode}
        disabled={isSubmitting}
        className="mt-4 block text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : 'No account yet? Create one'}
      </button>
    </section>
  );
}

export default AuthForm;
