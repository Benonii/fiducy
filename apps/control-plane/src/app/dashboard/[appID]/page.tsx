'use client';

import { AppSettingsFields } from '@/components/AppSettingsFields';
import { DangerZone } from '@/components/DangerZone';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageStatus } from '@/components/PageStatus';
import { QuickStart } from '@/components/QuickStart';
import { UsagePanel } from '@/components/UsagePanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { readAppSettingsForm } from '@/lib/client';
import { useApp, useGatewayURL, useUpdateApp } from '@/lib/queries';

import type { PageProps } from '@farm.js/core';
import type { FormEvent } from 'react';

export default function AppPage({ params = {} }: PageProps) {
  const appID = String(params.appID ?? '');
  const app = useApp(appID);
  const gatewayURL = useGatewayURL();
  const updateApp = useUpdateApp(appID);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateApp.mutate(readAppSettingsForm(event.currentTarget));
  }

  if (app.isPending) return <PageStatus isLoading>Loading app</PageStatus>;
  if (app.isError) return <ErrorAlert error={app.error} />;

  return (
    <main className="grid gap-6">
      <a className="text-muted-foreground text-sm underline" href="/dashboard">
        All apps
      </a>
      <div className="grid gap-1">
        <h1 className="font-bold text-3xl text-foreground tracking-tight">{app.data.name}</h1>
        <p className="text-muted-foreground text-sm">
          App ID <code>{app.data.appID}</code>, secret ending in{' '}
          <code>{app.data.appSecretPreview}</code>
        </p>
      </div>
      <UsagePanel appID={appID} />
      <Card render={<form onSubmit={saveSettings} />}>
        <CardHeader>
          <CardTitle render={(props) => <h2 {...props} />}>Settings</CardTitle>
        </CardHeader>
        <CardPanel className="grid gap-4">
          <AppSettingsFields defaults={app.data} />
          <Button className="justify-self-start" loading={updateApp.isPending} type="submit">
            Save settings
          </Button>
          {updateApp.isSuccess ? (
            <Alert>
              <AlertDescription>
                Saved. The gateway picks up changes within 30 seconds.
              </AlertDescription>
            </Alert>
          ) : null}
          <ErrorAlert error={updateApp.error} />
        </CardPanel>
      </Card>
      {gatewayURL.data ? <QuickStart appID={appID} gatewayURL={gatewayURL.data} /> : null}
      <DangerZone appID={appID} />
    </main>
  );
}
