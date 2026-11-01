'use client';

import { Button } from '@/components/ui/button';
import { readAppSettingsForm } from '@/lib/client';

import { AppSettingsFields } from './AppSettingsFields';
import { ErrorAlert } from './ErrorAlert';

import type { FormEvent } from 'react';
import type { CreateAppFormProps } from './types';

export function CreateAppForm({ isPending, error, onCreate }: CreateAppFormProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(readAppSettingsForm(event.currentTarget));
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <AppSettingsFields />
      <Button className="justify-self-start" loading={isPending} type="submit">
        Create app
      </Button>
      <ErrorAlert error={error} />
    </form>
  );
}
