'use client';

import { useEffect } from 'react';

import { GA_MEASUREMENT_ID, startAnalytics } from '@/lib/analytics';

export function Analytics() {
  useEffect(() => {
    if (GA_MEASUREMENT_ID) startAnalytics(GA_MEASUREMENT_ID);
  }, []);

  if (!GA_MEASUREMENT_ID) return null;
  return <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />;
}
