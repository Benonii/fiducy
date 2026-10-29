import { STRIPPED_REQUEST_HEADERS } from './constants';
import { fail, succeed } from './result';

import type { Result } from '@fiducy/core';
import type {
  ProviderConfiguration,
  StreamingRequestInit,
  UpstreamRequestError,
  UpstreamRequestInput
} from './types';

export function isPathAllowed(provider: ProviderConfiguration, path: string): boolean {
  if (!path.startsWith(provider.allowedPathPrefix)) return false;
  if (path.includes('..') || path.includes('//') || path.includes('\\')) return false;
  return new URL(path, provider.baseURL).origin === new URL(provider.baseURL).origin;
}

export function copyHeadersWithout(source: Headers, strippedNames: string[]): Headers {
  const copied = new Headers();
  for (const [name, value] of source) {
    if (strippedNames.includes(name.toLowerCase())) continue;
    if (name.toLowerCase().startsWith('x-fiducy-')) continue;
    copied.set(name, value);
  }
  return copied;
}

function buildUpstreamHeaders(provider: ProviderConfiguration, inbound: Headers, apiKey: string) {
  const headers = copyHeadersWithout(inbound, STRIPPED_REQUEST_HEADERS);
  for (const [name, value] of Object.entries(provider.defaultHeaders)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  headers.set(provider.authorizationHeader, provider.formatAuthorization(apiKey));
  return headers;
}

export function buildUpstreamRequest({
  provider,
  path,
  method,
  headers,
  body,
  apiKey
}: UpstreamRequestInput): Result<Request, UpstreamRequestError> {
  if (!isPathAllowed(provider, path)) return fail('path_not_allowed');
  const upstreamURL = new URL(path, provider.baseURL);
  const init: StreamingRequestInit = {
    method,
    headers: buildUpstreamHeaders(provider, headers, apiKey),
    body,
    duplex: 'half'
  };
  return succeed(new Request(upstreamURL.toString(), init));
}
