'use client';

import { AuthForm } from '@/components/AuthForm';
import { SiteFrame } from '@/components/SiteFrame';

export default function SignInPage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-md">
        <AuthForm mode="sign-in" />
      </div>
    </SiteFrame>
  );
}
