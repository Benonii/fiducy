import { EVENT_STREAM_TYPE, STRIPPED_RESPONSE_HEADERS } from './constants';
import { redactSecrets } from './redaction';
import { copyHeadersWithout } from './request';
import { observeUsageInBody } from './stream';
import { parseJSON, readUsage } from './usage';

import type { RelayResponseInput } from './types';

export async function relayResponse({
  upstreamResponse,
  apiKey,
  onUsage
}: RelayResponseInput): Promise<Response> {
  const headers = copyHeadersWithout(upstreamResponse.headers, STRIPPED_RESPONSE_HEADERS);
  const responseInit = { status: upstreamResponse.status, headers };

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text();
    return new Response(redactSecrets(errorText, apiKey), responseInit);
  }

  const isEventStream = headers.get('content-type')?.includes(EVENT_STREAM_TYPE) ?? false;
  if (isEventStream && upstreamResponse.body) {
    const observedBody = observeUsageInBody(upstreamResponse.body, onUsage);
    return new Response(observedBody, responseInit);
  }

  const bodyText = await upstreamResponse.text();
  onUsage(readUsage(parseJSON(bodyText)));
  return new Response(bodyText, responseInit);
}
