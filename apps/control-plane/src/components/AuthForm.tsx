'use client';

import { signIn, signUp } from '@farm.js/auth/client';
import { useMutation } from '@tanstack/react-query';

import { ErrorAlert } from '@/components/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { FormEvent } from 'react';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

interface Credentials {
  email: string;
  password: string;
  name: string;
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === 'sign-up';
  const authenticate = useMutation({
    mutationFn: async ({ email, password, name }: Credentials) => {
      const response = isSignUp
        ? await signUp({ email, password, name })
        : await signIn({ email, password });
      if (response.error) throw new Error(response.error.message ?? 'That did not work. Try again');
    },
    onSuccess: () => {
      window.location.href = '/dashboard';
    }
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    authenticate.mutate({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      name: String(formData.get('name') ?? '')
    });
  }

  return (
    <Card render={<form onSubmit={submit} />}>
      <CardHeader>
        <CardTitle render={(props) => <h1 {...props} />}>
          {isSignUp ? 'Create your developer account' : 'Sign in'}
        </CardTitle>
      </CardHeader>
      <CardPanel className="grid gap-4">
        {isSignUp ? (
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" required type="text" autoComplete="name" />
          </Field>
        ) : null}
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" required type="email" autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input
            name="password"
            required
            minLength={8}
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </Field>
        <Button loading={authenticate.isPending || authenticate.isSuccess} type="submit">
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>
        <ErrorAlert error={authenticate.error} />
      </CardPanel>
      <CardFooter className="text-muted-foreground text-sm">
        {isSignUp ? 'Already have an account?' : 'New here?'}
        <a className="ml-1 text-foreground underline" href={isSignUp ? '/sign-in' : '/sign-up'}>
          {isSignUp ? 'Sign in' : 'Create one'}
        </a>
      </CardFooter>
    </Card>
  );
}
