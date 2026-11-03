import { ConvexHttpClient } from 'convex/browser';

export const CONVEX_URL: string | null = import.meta.env.VITE_CONVEX_URL ?? null;

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient | null {
  if (!CONVEX_URL) return null;
  client ??= new ConvexHttpClient(CONVEX_URL);
  return client;
}
