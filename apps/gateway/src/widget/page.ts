import { buildWidgetScript } from './script';
import { WIDGET_STYLES } from './styles';

import type { WidgetPageInput } from '../types';

function escapeHTML(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderWidgetPage({ appID, appName, parentOrigin, nonce }: WidgetPageInput): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Connect your API key</title>
<style nonce="${nonce}">${WIDGET_STYLES}</style>
</head>
<body>
<form id="key-form" autocomplete="off">
  <div class="heading">
    <label for="api-key">Your API key</label>
    <span class="badge">Sealed in an enclave</span>
  </div>
  <div class="row">
    <div class="field">
      <input id="api-key" name="api-key" type="password" spellcheck="false" autocapitalize="off" placeholder="sk-..." required>
      <button id="toggle-button" class="ghost" type="button" aria-controls="api-key" aria-pressed="false">Show</button>
    </div>
    <button id="save-button" type="submit">Save key</button>
  </div>
  <p class="note">${escapeHTML(appName)} never sees your key. It is sealed and only opened to call your AI provider.</p>
  <p id="status" class="status" role="status"></p>
</form>
<div id="saved" class="saved" hidden>
  <div class="heading">
    <p class="status">Key saved and encrypted.</p>
    <span id="key-hint" class="badge"></span>
  </div>
  <p class="note">${escapeHTML(appName)} now holds a handle, not your key. You can revoke it at any time.</p>
</div>
<p class="footer">Secured by Fiducy</p>
<script nonce="${nonce}">${buildWidgetScript(appID, parentOrigin)}</script>
</body>
</html>`;
}

export function buildWidgetSecurityHeaders(nonce: string, parentOrigin: string): Headers {
  const contentSecurityPolicy = [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`,
    "font-src 'self'",
    "connect-src 'self'",
    `frame-ancestors ${parentOrigin}`,
    "base-uri 'none'",
    "form-action 'none'"
  ].join('; ');
  return new Headers({
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy': contentSecurityPolicy,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cache-control': 'no-store'
  });
}
