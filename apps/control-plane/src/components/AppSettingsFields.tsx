import type { AppSettings } from '../lib/types';

interface AppSettingsFieldsProps {
  defaults?: AppSettings;
}

export function AppSettingsFields({ defaults }: AppSettingsFieldsProps) {
  return (
    <>
      <label>
        App name
        <input name="name" required maxLength={80} defaultValue={defaults?.name} />
      </label>
      <label>
        Allowed origins
        <span className="hint">
          Sites that may embed the key widget, one per line, such as https://chat.example.com
        </span>
        <textarea name="allowedOrigins" defaultValue={defaults?.allowedOrigins.join('\n')} />
      </label>
      <label>
        Monthly request limit per user key
        <input
          name="monthlyRequestLimitPerKey"
          required
          type="number"
          min={1}
          defaultValue={defaults?.monthlyRequestLimitPerKey ?? 10000}
        />
      </label>
      <label>
        Key access
        <select name="accessMode" defaultValue={defaults?.accessMode ?? 'gateway'}>
          <option value="gateway">Gateway only (keys never leave Fiducy)</option>
          <option value="gateway_and_release">
            Gateway and key release (your server may fetch a key for 5 minutes)
          </option>
        </select>
      </label>
    </>
  );
}
