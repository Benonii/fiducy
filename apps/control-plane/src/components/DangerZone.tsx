'use client';

import { useState } from 'react';

import { requestControlPlane } from '../lib/client';
import { SecretReveal } from './SecretReveal';

import type { CreatedApp } from '../lib/types';

interface DangerZoneProps {
  appID: string;
}

export function DangerZone({ appID }: DangerZoneProps) {
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function rotateSecret() {
    if (!window.confirm('Rotate the secret? Your servers must switch to the new one.')) return;
    const response = await requestControlPlane<CreatedApp>(`/api/apps/${appID}/secret`, {
      method: 'POST'
    });
    if (!response.ok) return setErrorMessage(response.message);
    setRotatedSecret(response.data.appSecret);
  }

  async function deleteApp() {
    if (!window.confirm('Delete this app? Every user key handle it holds stops working.')) return;
    const response = await requestControlPlane(`/api/apps/${appID}`, { method: 'DELETE' });
    if (!response.ok) return setErrorMessage(response.message);
    window.location.href = '/dashboard';
  }

  return (
    <section className="card stack">
      <h2>Secret and removal</h2>
      <div className="row">
        <button className="secondary" onClick={rotateSecret} type="button">
          Rotate app secret
        </button>
        <button className="danger" onClick={deleteApp} type="button">
          Delete app
        </button>
      </div>
      {rotatedSecret ? <SecretReveal appSecret={rotatedSecret} /> : null}
      {errorMessage ? <p className="notice error">{errorMessage}</p> : null}
    </section>
  );
}
