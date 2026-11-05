import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { createServer } from 'node:http';

import { CHAT_APP, startGatewayHarness } from '../../../apps/gateway/tests/harness';
import { toNextJsHandler } from '../src/next';
import { toNodeHandler, toWebRequest } from '../src/node';
import { toNuxtHandler } from '../src/nuxt';
import { toReactRouterHandlers } from '../src/reactRouter';
import { svelteKitHandler } from '../src/sveltekit';
import { toTanStackHandlers } from '../src/tanstack';
import { appRequest, connectKey, createTestApp } from './fixtures';

import type { Server } from 'node:http';
import type { GatewayHarness } from './fixtures';

let harness: GatewayHarness;
let nodeServer: Server;
let nodeURL: string;
const fiducy = () => createTestApp(harness, CHAT_APP);

beforeAll(async () => {
  harness = await startGatewayHarness();
  const instance = fiducy();
  await connectKey(harness, instance, CHAT_APP, 'node_user');
  const handleNode = toNodeHandler(instance);
  nodeServer = createServer((request, response) => {
    if (request.url?.startsWith('/parsed')) {
      Object.assign(request, { body: { provider: 'openai', handle: 'kh_bad' } });
      Object.assign(request, { originalUrl: '/api/fiducy/keys', url: '/keys' });
    }
    handleNode(request, response);
  });
  await new Promise<void>((resolve) => nodeServer.listen(0, resolve));
  const address = nodeServer.address();
  nodeURL = `http://localhost:${typeof address === 'object' ? address?.port : 0}`;
});

afterAll(() => {
  nodeServer.close();
  harness.stop();
});

describe('Node req/res servers (Express, Fastify, Nest)', () => {
  it('serves the key routes from a plain node:http server', async () => {
    const response = await fetch(`${nodeURL}/api/fiducy/keys`, {
      headers: { 'x-user': 'node_user' }
    });
    const body = (await response.json()) as { data: { keys: unknown[] } };
    expect(response.status).toBe(200);
    expect(body.data.keys).toHaveLength(1);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('streams request bodies and still enforces the size limit', async () => {
    const response = await fetch(`${nodeURL}/api/fiducy/keys`, {
      method: 'POST',
      headers: { 'x-user': 'node_user', 'content-type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(40000) })
    });
    expect(response.status).toBe(400);
  });

  it('uses a body that express.json() already parsed, and the original mount path', async () => {
    const response = await fetch(`${nodeURL}/parsed`, {
      method: 'POST',
      headers: { 'x-user': 'node_user', 'content-type': 'application/json' }
    });
    expect(response.status).toBe(400);
    expect(((await response.json()) as { message: string }).message).toBe(
      'The key handle is malformed'
    );
  });

  it('builds a web request with every header value', () => {
    const request = toWebRequest(
      Object.assign(Object.create(null), {
        method: 'GET',
        url: '/api/fiducy/keys',
        headers: { host: 'notes.example', cookie: 'a=1', 'x-list': ['one', 'two'] },
        socket: {}
      })
    );
    expect(request.url).toBe('http://notes.example/api/fiducy/keys');
    expect(request.headers.get('x-list')).toBe('one, two');
  });
});

describe('route helpers for Web Request frameworks', () => {
  it('answers through the Next.js, TanStack Start and React Router shapes', async () => {
    const instance = fiducy();
    const request = () => appRequest('/keys', 'helper_user');
    const next = toNextJsHandler(instance);
    const tanstack = toTanStackHandlers(instance);
    const reactRouter = toReactRouterHandlers(instance);
    const statuses = await Promise.all([
      next.GET(request()),
      tanstack.GET({ request: request() }),
      reactRouter.loader({ request: request() })
    ]);
    expect(statuses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  it('lets SvelteKit resolve every other path', async () => {
    const instance = fiducy();
    const resolve = () => new Response('page');
    const page = await svelteKitHandler({
      event: { request: appRequest('/keys', 'x'), url: new URL('https://chat.example/notes') },
      resolve,
      fiducy: instance
    });
    const keys = await svelteKitHandler({
      event: {
        request: appRequest('/keys', 'x'),
        url: new URL('https://chat.example/api/fiducy/keys')
      },
      resolve,
      fiducy: instance
    });
    const lookalike = await svelteKitHandler({
      event: {
        request: appRequest('/keys', 'x'),
        url: new URL('https://chat.example/api/fiducyx')
      },
      resolve,
      fiducy: instance
    });
    expect(await page.text()).toBe('page');
    expect(keys.status).toBe(200);
    expect(await lookalike.text()).toBe('page');
  });

  it('takes the Request from an h3 v2 event and builds one from an h3 v1 event', async () => {
    const instance = fiducy();
    const handle = toNuxtHandler(instance);
    const fromWebEvent = await handle({
      req: appRequest('/keys', 'nuxt_user'),
      node: { req: Object.create(null) }
    });
    expect(fromWebEvent.status).toBe(200);
  });
});
