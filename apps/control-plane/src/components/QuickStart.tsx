import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';

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
  const steps = [
    {
      text: '1. Let users paste their key into the widget. You get back a handle.',
      code: widgetSnippet
    },
    { text: '2. Call the provider through the gateway with your app secret.', code: serverSnippet }
  ];
  return (
    <Card render={<section />}>
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Connect your app</CardTitle>
      </CardHeader>
      <CardPanel className="grid gap-3">
        {steps.map((step) => (
          <div key={step.text} className="grid gap-2">
            <p className="text-muted-foreground text-sm">{step.text}</p>
            <pre className="overflow-x-auto border bg-muted p-3 text-xs">{step.code}</pre>
          </div>
        ))}
      </CardPanel>
    </Card>
  );
}
