import { CopyButton } from './CopyButton';
import { Panel } from './Panel';

import type { QuickStartProps } from './types';

function buildSteps({ appID, gatewayURL }: QuickStartProps) {
  return [
    {
      title: 'Let users paste their key into the widget',
      detail: 'You get back a handle. Store it next to the user.',
      code: `import { mountKeyWidget } from '@fiducy/widget';

mountKeyWidget({
  gatewayURL: '${gatewayURL}',
  appID: '${appID}',
  container: document.querySelector('#key-widget'),
  onHandle: (handle) => saveHandleForUser(handle)
});`
    },
    {
      title: 'Call the provider through the gateway',
      detail: 'Use your app secret and the user handle. The key itself never reaches your server.',
      code: `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.FIDUCY_APP_SECRET,
  baseURL: '${gatewayURL}/openai/v1',
  defaultHeaders: { 'x-key-handle': userHandle }
});`
    }
  ];
}

export function QuickStart(props: QuickStartProps) {
  return (
    <Panel
      title="Connect your app"
      description="Two steps. Both values below are already filled in for this app."
    >
      <ol className="grid min-w-0 gap-6">
        {buildSteps(props).map((step, index) => (
          <li key={step.title} className="grid min-w-0 gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-ink-quiet text-xs">0{index + 1}</span>
                <div className="grid gap-0.5">
                  <p className="font-medium text-foreground text-sm">{step.title}</p>
                  <p className="text-ink-quiet text-xs">{step.detail}</p>
                </div>
              </div>
              <CopyButton label="code" value={step.code} />
            </div>
            <pre className="min-w-0 overflow-x-auto border bg-surface p-4 text-xs leading-relaxed">
              {step.code}
            </pre>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
