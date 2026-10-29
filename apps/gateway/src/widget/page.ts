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
  <label for="api-key">Your API key</label>
  <div class="row">
    <input id="api-key" name="api-key" type="password" spellcheck="false" autocapitalize="off" placeholder="sk-..." required>
    <button id="save-button" type="submit">Save key</button>
  </div>
  <p class="note">${escapeHTML(appName)} never sees your key. It is encrypted and only used to call your AI provider.</p>
  <p id="status" class="status" role="status"></p>
</form>
<div id="saved" class="saved" hidden>
  <p class="status">Key saved and encrypted.</p>
  <p class="note">${escapeHTML(appName)} now holds a handle, not your key. You can revoke it at any time.</p>
</div>
<script nonce="${nonce}">${buildWidgetScript(appID, parentOrigin)}</script>
</body>
</html>`;
}

export function buildWidgetSecurityHeaders(nonce: string, parentOrigin: string): Headers {
  const contentSecurityPolicy = [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`,
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
