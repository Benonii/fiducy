import { useEffect } from 'react';

import { isSignedOut } from '@/lib/client';

export function useSignInRedirect(error: unknown) {
  const signedOut = isSignedOut(error);

  useEffect(() => {
    if (signedOut) window.location.replace('/sign-in');
  }, [signedOut]);

  return signedOut;
}
