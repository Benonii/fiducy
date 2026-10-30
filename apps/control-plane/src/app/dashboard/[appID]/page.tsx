'use client';

import { useEffect, useState } from 'react';

import { AppSettingsFields } from '@/components/AppSettingsFields';
import { DangerZone } from '@/components/DangerZone';
import { QuickStart } from '@/components/QuickStart';
import { UsagePanel } from '@/components/UsagePanel';
import { readAppSettingsForm, requestControlPlane } from '@/lib/client';

import type { AppView, UsageSummary } from '@/lib/types';
import type { PageProps } from '@farm.js/core';
import type { FormEvent } from 'react';

export default function AppPage({ params = {} }: PageProps) {
  const appID = String(params.appID ?? '');
  const [app, setApp] = useState<AppView | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [gatewayURL, setGatewayURL] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    requestControlPlane<AppView>(`/api/apps/${appID}`).then((response) =>
      response.ok ? setApp(response.data) : setErrorMessage(response.message)
    );
    requestControlPlane<UsageSummary>(`/api/apps/${appID}/usage`).then((response) => {
      if (response.ok) setUsage(response.data);
    });
    requestControlPlane<{ gatewayURL: string }>('/api/config').then((response) => {
      if (response.ok) setGatewayURL(response.data.gatewayURL);
    });
  }, [appID]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    const response = await requestControlPlane<AppView>(`/api/apps/${appID}`, {
      method: 'PATCH',
      body: JSON.stringify(readAppSettingsForm(event.currentTarget))
    });
    if (!response.ok) return setErrorMessage(response.message);
    setApp(response.data);
    setStatusMessage('Saved. The gateway picks up changes within 30 seconds.');
  }

  if (!app) {
    return <p className="card">{errorMessage ?? 'Loading app'}</p>;
  }

  return (
    <main className="stack">
      <p>
        <a href="/dashboard">All apps</a>
      </p>
      <h1>{app.name}</h1>
      <p>
        App ID <code>{app.appID}</code>, secret ending in <code>{app.appSecretPreview}</code>
      </p>
      <UsagePanel usage={usage} />
      <form className="card stack" onSubmit={saveSettings}>
        <h2>Settings</h2>
        <AppSettingsFields defaults={app} />
        <button type="submit">Save settings</button>
        {statusMessage ? <p className="notice">{statusMessage}</p> : null}
        {errorMessage ? <p className="notice error">{errorMessage}</p> : null}
      </form>
      {gatewayURL ? <QuickStart appID={app.appID} gatewayURL={gatewayURL} /> : null}
      <DangerZone appID={app.appID} />
    </main>
  );
}
