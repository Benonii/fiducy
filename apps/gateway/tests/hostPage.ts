import { resolve } from 'node:path';

export async function startHostPage(gatewayURL: string, appID: string) {
  const build = await Bun.build({
    entrypoints: [resolve(import.meta.dir, '../../../packages/widget/src/index.ts')],
    target: 'browser',
    format: 'esm'
  });
  const clientScript = await build.outputs[0]?.text();
  const page = `<!doctype html><html><body>
<h1>Chatforge settings</h1>
<div id="slot"></div>
<pre id="result"></pre>
<script type="module">
import { mountKeyWidget } from '/client.js';
const result = document.getElementById('result');
mountKeyWidget({
  gatewayURL: '${gatewayURL}',
  appID: '${appID}',
  container: document.getElementById('slot'),
  onHandle: (handle) => { result.textContent = handle; },
  onError: (message) => { result.textContent = 'error: ' + message; }
});
</script></body></html>`;
  const server = Bun.serve({
    port: 0,
    fetch: (request) => {
      const { pathname } = new URL(request.url);
      if (pathname === '/client.js') {
        return new Response(clientScript, { headers: { 'content-type': 'text/javascript' } });
      }
      return new Response(page, { headers: { 'content-type': 'text/html' } });
    }
  });
  return { server, hostURL: `http://127.0.0.1:${server.port}` };
}
