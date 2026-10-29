import type { ClientResponse } from './types';

function readErrorMessage(body: Record<string, unknown>): string {
  if (typeof body.message === 'string') return body.message;
  const details = body.details as Array<{ message?: string }> | undefined;
  return details?.[0]?.message ?? 'Something went wrong';
}

export async function requestControlPlane<Data>(
  path: string,
  init: RequestInit = {}
): Promise<ClientResponse<Data>> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...init.headers }
  });
  const body = (await response.json()) as Record<string, unknown>;
  if (!response.ok) return { ok: false, status: response.status, message: readErrorMessage(body) };
  return { ok: true, data: body.data as Data, message: String(body.message ?? '') };
}

export function parseOriginList(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function readAppSettingsForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  return {
    name: String(formData.get('name') ?? ''),
    allowedOrigins: parseOriginList(String(formData.get('allowedOrigins') ?? '')),
    monthlyRequestLimitPerKey: Number(formData.get('monthlyRequestLimitPerKey')),
    accessMode: String(formData.get('accessMode') ?? 'gateway')
  };
}
