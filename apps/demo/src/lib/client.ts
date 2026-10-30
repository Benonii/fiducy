import type { PublicDemoConfig } from './types';

export class DemoRequestError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export async function fetchDemoConfig(): Promise<PublicDemoConfig> {
  const response = await fetch('/api/config');
  const body = (await response.json()) as { data: PublicDemoConfig | null; message: string };
  if (!response.ok || !body.data) throw new DemoRequestError(response.status, body.message);
  return body.data;
}
