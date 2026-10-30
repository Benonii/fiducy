'use client';

import { ErrorAlert } from '@/components/ErrorAlert';
import { SecretReveal } from '@/components/SecretReveal';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardPanel, CardTitle } from '@/components/ui/card';
import { useDeleteApp, useRotateSecret } from '@/lib/queries';

import type { ReactElement } from 'react';

interface ConfirmActionProps {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" />} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}

interface DangerZoneProps {
  appID: string;
}

export function DangerZone({ appID }: DangerZoneProps) {
  const rotateSecret = useRotateSecret(appID);
  const deleteApp = useDeleteApp(appID);

  function confirmDelete() {
    deleteApp.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/dashboard';
      }
    });
  }

  return (
    <Card render={<section />}>
      <CardHeader>
        <CardTitle render={(props) => <h2 {...props} />}>Secret and removal</CardTitle>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <ConfirmAction
            trigger={
              <Button variant="outline" loading={rotateSecret.isPending}>
                Rotate app secret
              </Button>
            }
            title="Rotate the app secret?"
            description="Your servers must switch to the new secret. The old one stops working shortly."
            confirmLabel="Rotate secret"
            onConfirm={() => rotateSecret.mutate()}
          />
          <ConfirmAction
            trigger={
              <Button variant="destructive-outline" loading={deleteApp.isPending}>
                Delete app
              </Button>
            }
            title="Delete this app?"
            description="Every user key handle it holds stops working. This cannot be undone."
            confirmLabel="Delete app"
            onConfirm={confirmDelete}
          />
        </div>
        {rotateSecret.data ? <SecretReveal appSecret={rotateSecret.data.appSecret} /> : null}
        <ErrorAlert error={rotateSecret.error ?? deleteApp.error} />
      </CardPanel>
    </Card>
  );
}
