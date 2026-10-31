import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { AppSettings } from '@/lib/types';
import type { AppSettingsFieldsProps } from './types';

const ACCESS_MODES = [
  { label: 'Gateway only (keys never leave Fiducy)', value: 'gateway' },
  {
    label: 'Gateway and key release (your server may fetch a key for 5 minutes)',
    value: 'gateway_and_release'
  }
];

const RECORD_STORAGE_OPTIONS = [
  { label: 'With Fiducy (your app stores only a handle)', value: 'fiducy' },
  { label: 'In your database (your app sends the record with each call)', value: 'app' }
];

function describeRecordStorage(recordStorage: AppSettings['recordStorage']): string {
  const value = recordStorage ?? 'fiducy';
  return RECORD_STORAGE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function AppSettingsFields({ defaults }: AppSettingsFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel>App name</FieldLabel>
        <Input name="name" required maxLength={80} defaultValue={defaults?.name} />
      </Field>
      <Field>
        <FieldLabel>Allowed origins</FieldLabel>
        <Textarea
          name="allowedOrigins"
          className="font-mono"
          defaultValue={defaults?.allowedOrigins.join('\n')}
        />
        <FieldDescription>
          Sites that may embed the key widget, one per line, such as https://chat.example.com
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Monthly request limit per user key</FieldLabel>
        <Input
          name="monthlyRequestLimitPerKey"
          required
          type="number"
          min={1}
          defaultValue={defaults?.monthlyRequestLimitPerKey ?? 10000}
        />
      </Field>
      <Field>
        <FieldLabel>Key access</FieldLabel>
        <Select
          name="accessMode"
          items={ACCESS_MODES}
          defaultValue={defaults?.accessMode ?? 'gateway'}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {ACCESS_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <FieldDescription>
          Key release sends the plain key to your server. Leave it off unless a feature needs it.
        </FieldDescription>
      </Field>
      {defaults ? (
        <Field>
          <FieldLabel>Where sealed keys live</FieldLabel>
          <Input readOnly value={describeRecordStorage(defaults.recordStorage)} />
          <FieldDescription>
            Set when the app is created. Create a new app to store keys the other way.
          </FieldDescription>
        </Field>
      ) : (
        <Field>
          <FieldLabel>Where sealed keys live</FieldLabel>
          <Select name="recordStorage" items={RECORD_STORAGE_OPTIONS} defaultValue="fiducy">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {RECORD_STORAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <FieldDescription>You can't change this after the app is created.</FieldDescription>
        </Field>
      )}
    </>
  );
}
