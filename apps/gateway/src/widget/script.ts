import { WIDGET_MESSAGE_TYPES } from '@fiducy/widget/constants';

export function buildWidgetScript(appID: string, parentOrigin: string): string {
  const settings = JSON.stringify({ appID, parentOrigin, messageTypes: WIDGET_MESSAGE_TYPES });
  return `
const settings = ${settings.replaceAll('<', '\\u003c')};
const form = document.getElementById('key-form');
const input = document.getElementById('api-key');
const button = document.getElementById('save-button');
const status = document.getElementById('status');
const saved = document.getElementById('saved');
const toggle = document.getElementById('toggle-button');
const keyHint = document.getElementById('key-hint');
toggle.addEventListener('click', () => {
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  toggle.textContent = isHidden ? 'Hide' : 'Show';
  toggle.setAttribute('aria-pressed', String(isHidden));
});
const notifyParent = (message) => window.parent.postMessage(message, settings.parentOrigin);
const showStatus = (text, isError) => {
  status.textContent = text;
  status.dataset.state = isError ? 'error' : 'idle';
};
const submitKey = async (apiKey) => {
  const response = await fetch('/keys', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ appID: settings.appID, apiKey })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message);
  return body.data;
};
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const apiKey = input.value.trim();
  if (!apiKey) return showStatus('Paste your API key first.', true);
  button.disabled = true;
  showStatus('Encrypting and saving...', false);
  try {
    const { handle, record } = await submitKey(apiKey);
    keyHint.textContent = 'ends in ' + apiKey.slice(-4);
    form.hidden = true;
    saved.hidden = false;
    notifyParent({ type: settings.messageTypes.handle, handle, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showStatus(message, true);
    notifyParent({ type: settings.messageTypes.error, message });
  } finally {
    input.value = '';
    input.type = 'password';
    toggle.textContent = 'Show';
    toggle.setAttribute('aria-pressed', 'false');
    button.disabled = false;
  }
});
notifyParent({ type: settings.messageTypes.ready });
`;
}
