'use client';

import { AuthForm } from '@/components/AuthForm';
import { SiteFrame } from '@/components/SiteFrame';

export default function SignUpPage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-md">
        <AuthForm mode="sign-up" />
      </div>
    </SiteFrame>
  );
}
