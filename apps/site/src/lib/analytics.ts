export const GA_MEASUREMENT_ID: string | null = import.meta.env.VITE_GA_MEASUREMENT_ID ?? null;

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

export function startAnalytics(measurementID: string) {
  if (window.gtag) return;
  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  window.gtag = function gtag() {
    // biome-ignore lint/style/noArguments: gtag.js only reads Arguments objects from the dataLayer
    dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementID);
}

export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  window.gtag?.('event', name, params);
}
