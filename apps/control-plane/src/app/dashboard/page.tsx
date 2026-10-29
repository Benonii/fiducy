'use client';

import { useCallback, useEffect, useState } from 'react';

import { AppSettingsFields } from '../../components/AppSettingsFields';
import { SecretReveal } from '../../components/SecretReveal';
import { readAppSettingsForm, requestControlPlane } from '../../lib/client';

import type { FormEvent } from 'react';
import type { AppView, CreatedApp } from '../../lib/types';

type DashboardState = { status: 'loading' } | { status: 'signed_out' } | { status: 'ready' };

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [apps, setApps] = useState<AppView[]>([]);
  const [created, setCreated] = useState<CreatedApp | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadApps = useCallback(async () => {
    const response = await requestControlPlane<AppView[]>('/api/apps');
    if (!response.ok) {
      setState({ status: response.status === 401 ? 'signed_out' : 'ready' });
      if (response.status !== 401) setErrorMessage(response.message);
      return;
    }
    setApps(response.data);
    setState({ status: 'ready' });
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  async function createApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsCreating(true);
    setErrorMessage(null);
    const response = await requestControlPlane<CreatedApp>('/api/apps', {
      method: 'POST',
      body: JSON.stringify(readAppSettingsForm(form))
    });
    setIsCreating(false);
    if (!response.ok) {
      setErrorMessage(response.message);
      return;
    }
    form.reset();
    setCreated(response.data);
    await loadApps();
  }

  if (state.status === 'loading') return <p>Loading your apps</p>;
  if (state.status === 'signed_out') {
    return (
      <p className="card">
        <a href="/sign-in">Sign in</a> to manage your apps.
      </p>
    );
  }

  return (
    <main className="stack">
      <h1>Your apps</h1>
      {created ? (
        <div className="card stack">
          <h2>{created.app.name} is ready</h2>
          <p>
            App ID <code>{created.app.appID}</code>
          </p>
          <SecretReveal appSecret={created.appSecret} />
        </div>
      ) : null}
      {apps.length === 0 ? <p className="hint">No apps yet. Create one below.</p> : null}
      {apps.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>App ID</th>
              <th>Secret</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.appID}>
                <td>
                  <a href={`/dashboard/${app.appID}`}>{app.name}</a>
                </td>
                <td className="mono">{app.appID}</td>
                <td className="mono">...{app.appSecretPreview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <form className="card stack" onSubmit={createApp}>
        <h2>Create an app</h2>
        <AppSettingsFields />
        <button disabled={isCreating} type="submit">
          {isCreating ? 'Creating' : 'Create app'}
        </button>
        {errorMessage ? <p className="notice error">{errorMessage}</p> : null}
      </form>
    </main>
  );
}
