'use client';

import { AppSettingsFields } from '@/components/AppSettingsFields';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageStatus } from '@/components/PageStatus';
import { SecretReveal } from '@/components/SecretReveal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { isSignedOut, readAppSettingsForm } from '@/lib/client';
import { useApps, useCreateApp } from '@/lib/queries';

import type { FormEvent } from 'react';

export default function DashboardPage() {
  const apps = useApps();
  const createApp = useCreateApp();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    createApp.mutate(readAppSettingsForm(form), { onSuccess: () => form.reset() });
  }

  if (apps.isPending) return <PageStatus isLoading>Loading your apps</PageStatus>;
  if (isSignedOut(apps.error)) {
    return (
      <PageStatus>
        <a className="text-foreground underline" href="/sign-in">
          Sign in
        </a>
        to manage your apps.
      </PageStatus>
    );
  }

  const created = createApp.data;
  return (
    <main className="grid gap-6">
      <h1 className="font-bold text-3xl text-foreground tracking-tight">Your apps</h1>
      <ErrorAlert error={apps.error} />
      {created ? (
        <Card>
          <CardHeader>
            <CardTitle render={(props) => <h2 {...props} />}>{created.app.name} is ready</CardTitle>
          </CardHeader>
          <CardPanel className="grid gap-4">
            <p className="text-sm">
              App ID <code>{created.app.appID}</code>
            </p>
            <SecretReveal appSecret={created.appSecret} />
          </CardPanel>
        </Card>
      ) : null}
      {apps.data?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>App ID</TableHead>
              <TableHead>Secret</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.data.map((app) => (
              <TableRow key={app.appID}>
                <TableCell>
                  <a
                    className="font-medium text-foreground underline"
                    href={`/dashboard/${app.appID}`}
                  >
                    {app.name}
                  </a>
                </TableCell>
                <TableCell className="font-mono">{app.appID}</TableCell>
                <TableCell className="font-mono">...{app.appSecretPreview}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No apps yet</EmptyTitle>
            <EmptyDescription>Create one below.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <Card render={<form onSubmit={submit} />}>
        <CardHeader>
          <CardTitle render={(props) => <h2 {...props} />}>Create an app</CardTitle>
        </CardHeader>
        <CardPanel className="grid gap-4">
          <AppSettingsFields />
          <Button className="justify-self-start" loading={createApp.isPending} type="submit">
            Create app
          </Button>
          <ErrorAlert error={createApp.error} />
        </CardPanel>
      </Card>
    </main>
  );
}
