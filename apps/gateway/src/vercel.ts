import { createGatewayFromEnvironment } from './environment';

import type { VercelRequestContext } from './types';

const runtime = createGatewayFromEnvironment();

export async function handleVercelRequest(
  request: Request,
  context?: VercelRequestContext
): Promise<Response> {
  const { handleRequest, usageLedger } = await runtime;
  const response = await handleRequest(request);
  if (usageLedger) context?.waitUntil?.(flushAfterResponse(response, usageLedger.flush));
  return response;
}

async function flushAfterResponse(response: Response, flush: () => Promise<number>) {
  await response
    .clone()
    .arrayBuffer()
    .catch(() => null);
  await flush();
}
