'use client';

import { AuthForm } from '@/components/AuthForm';
import { AuthFrame } from '@/components/AuthFrame';

export default function SignUpPage() {
  return (
    <AuthFrame mode="sign-up">
      <AuthForm mode="sign-up" />
    </AuthFrame>
  );
}
