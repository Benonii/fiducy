'use client';

import { AuthForm } from '@/components/AuthForm';
import { AuthFrame } from '@/components/AuthFrame';

export default function SignInPage() {
  return (
    <AuthFrame mode="sign-in">
      <AuthForm mode="sign-in" />
    </AuthFrame>
  );
}
