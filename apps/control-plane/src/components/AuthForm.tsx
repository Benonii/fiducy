'use client';

import { signIn, signUp } from '@farm.js/auth/client';
import { useState } from 'react';

import type { FormEvent } from 'react';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSignUp = mode === 'sign-up';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    const name = String(formData.get('name') ?? '');
    const response = isSignUp
      ? await signUp({ email, password, name })
      : await signIn({ email, password });
    if (response.error) {
      setErrorMessage(response.error.message ?? 'That did not work. Try again');
      setIsPending(false);
      return;
    }
    window.location.href = '/dashboard';
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <h1>{isSignUp ? 'Create your developer account' : 'Sign in'}</h1>
      {isSignUp ? (
        <label>
          Name
          <input name="name" required type="text" autoComplete="name" />
        </label>
      ) : null}
      <label>
        Email
        <input name="email" required type="email" autoComplete="email" />
      </label>
      <label>
        Password
        <input
          name="password"
          required
          minLength={8}
          type="password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
      </label>
      <button disabled={isPending} type="submit">
        {isPending ? 'Working' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
      {errorMessage ? <p className="notice error">{errorMessage}</p> : null}
      <p className="hint">
        {isSignUp ? 'Already have an account? ' : 'New here? '}
        <a href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create one'}</a>
      </p>
    </form>
  );
}
