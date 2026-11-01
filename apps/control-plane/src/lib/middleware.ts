import { auth } from '@farm.js/auth/server';

import { noteGatewayContact } from './gatewayStatusService';
import { respondWith } from './responses';
import { matchesToken } from './secrets';
import { getControlStore } from './storage';

import type { EndpointMiddlewareContext } from '@farm.js/core/api';

export async function requireOwner() {
  const user = await auth.user();
  if (!user) return respondWith(401, null, 'Sign in to manage your apps');
  return { ownerID: user.id };
}

export async function requireGateway({ request }: EndpointMiddlewareContext) {
  const gatewayToken = process.env.FIDUCY_GATEWAY_TOKEN;
  if (!gatewayToken)
    return respondWith(503, null, 'Set FIDUCY_GATEWAY_TOKEN to accept the gateway');
  const authorization = request.headers.get('authorization') ?? '';
  const receivedToken = authorization.replace(/^Bearer\s+/i, '');
  if (!matchesToken(receivedToken, gatewayToken)) {
    return respondWith(401, null, 'This gateway token is not valid');
  }
  await noteGatewayContact(getControlStore());
  return true;
}
