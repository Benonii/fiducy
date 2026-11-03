'use client';

import { useEffect, useState } from 'react';

export function useMotionAllowed() {
  const [isAllowed, setIsAllowed] = useState(false);
  useEffect(() => {
    setIsAllowed(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return isAllowed;
}
