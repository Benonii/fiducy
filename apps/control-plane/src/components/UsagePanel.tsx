'use client';

import { PageStatus } from '@/components/PageStatus';
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { useUsage } from '@/lib/queries';

interface UsagePanelProps {
  appID: string;
}

export function UsagePanel({ appID }: UsagePanelProps) {
  const usage = useUsage(appID);
  if (!usage.data) {
    return (
      <PageStatus isLoading={usage.isPending}>{usage.error?.message ?? 'Loading usage'}</PageStatus>
    );
  }
  const stats = [
    { label: 'requests', value: usage.data.requestCount, testID: 'request-count' },
    { label: 'input tokens', value: usage.data.inputTokens },
    { label: 'output tokens', value: usage.data.outputTokens },
    { label: 'active user keys', value: Object.keys(usage.data.requestsByKey).length }
  ];
  return (
    <Card render={<section aria-label="Usage this month" />}>
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Usage in {usage.data.month}</CardTitle>
        <CardDescription>
          Token counts only. Fiducy never stores prompts or replies.
        </CardDescription>
      </CardHeader>
      <CardPanel className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="grid gap-0.5">
            <strong className="font-mono text-2xl text-foreground" data-testid={stat.testID}>
              {stat.value}
            </strong>
            <span className="text-muted-foreground text-xs">{stat.label}</span>
          </div>
        ))}
      </CardPanel>
    </Card>
  );
}
