'use client';

import { Chat } from '@/components/Chat';
import { Spinner } from '@/components/ui/spinner';
import { useDemoConfig } from '@/lib/queries';

export default function DemoPage() {
  const config = useDemoConfig();

  if (config.isPending) {
    return (
      <p className="flex items-center gap-2 p-6 text-muted-foreground text-sm">
        <Spinner />
        Loading
      </p>
    );
  }
  if (config.isError) return <p className="p-6 text-destructive text-sm">{config.error.message}</p>;
  return <Chat config={config.data} />;
}
