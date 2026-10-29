import { buildWidgetSecurityHeaders, renderWidgetPage } from '../widget/page';

import type { GatewayDependencies } from '../types';

function createNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}

export async function serveWidget(request: Request, { appDirectory }: GatewayDependencies) {
  const searchParams = new URL(request.url).searchParams;
  const app = await appDirectory.findApp(searchParams.get('app') ?? '');
  if (!app) return new Response('This app is not registered', { status: 404 });
  const parentOrigin = searchParams.get('origin') ?? '';
  if (!app.allowedOrigins.includes(parentOrigin)) {
    return new Response('This site is not allowed to embed the key widget', { status: 403 });
  }
  const nonce = createNonce();
  const page = renderWidgetPage({ appID: app.appID, appName: app.name, parentOrigin, nonce });
  return new Response(page, { headers: buildWidgetSecurityHeaders(nonce, parentOrigin) });
}
