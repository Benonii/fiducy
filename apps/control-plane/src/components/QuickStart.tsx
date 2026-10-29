interface QuickStartProps {
  appID: string;
  gatewayURL: string;
}

export function QuickStart({ appID, gatewayURL }: QuickStartProps) {
  const widgetSnippet = `import { mountKeyWidget } from '@fiducy/widget';

mountKeyWidget({
  gatewayURL: '${gatewayURL}',
  appID: '${appID}',
  container: document.querySelector('#key-widget'),
  onHandle: (handle) => saveHandleForUser(handle)
});`;
  const serverSnippet = `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.FIDUCY_APP_SECRET,
  baseURL: '${gatewayURL}/openai/v1',
  defaultHeaders: { 'x-key-handle': userHandle }
});`;
  return (
    <section className="card stack">
      <h2>Connect your app</h2>
      <p className="hint">1. Let users paste their key into the widget. You get back a handle.</p>
      <pre>{widgetSnippet}</pre>
      <p className="hint">2. Call the provider through the gateway with your app secret.</p>
      <pre>{serverSnippet}</pre>
    </section>
  );
}
