'use client';

import { Chat } from '@/components/Chat';
import { ConnectKey } from '@/components/ConnectKey';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useStoredHandle } from '@/lib/handleStorage';
import { useDemoConfig } from '@/lib/queries';

export default function DemoPage() {
  const config = useDemoConfig();
  const [handle, setHandle] = useStoredHandle();

  if (config.isPending) {
    return (
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <Spinner />
        Loading
      </p>
    );
  }
  if (config.isError) {
    return (
      <Alert variant="error">
        <AlertDescription>{config.error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!handle) return <ConnectKey config={config.data} onHandle={setHandle} />;
  return <Chat handle={handle} onForgetKey={() => setHandle(null)} />;
}
