import type { ControlPlaneConnection } from './types';

export async function callControlPlane(
  { controlPlaneURL, gatewayToken }: ControlPlaneConnection,
  path: string,
  init: RequestInit = {},
  emptyStatuses: number[] = []
): Promise<unknown> {
  const response = await fetch(new URL(path, controlPlaneURL), {
    ...init,
    headers: {
      authorization: `Bearer ${gatewayToken}`,
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers
    }
  });
  if (emptyStatuses.includes(response.status)) return null;
  if (!response.ok) throw new Error(`Control plane answered ${response.status} for ${path}`);
  const body = (await response.json()) as { data: unknown };
  return body.data;
}

export function normalizeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
