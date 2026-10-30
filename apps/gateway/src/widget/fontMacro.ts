import { readFileSync } from 'node:fs';

// Runs at bundle time (imported with type: 'macro'), so the enclave image carries the font
// without needing node_modules at runtime.
export function readWidgetFontBase64(): string {
  const path = Bun.resolveSync(
    '@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
    import.meta.dir
  );
  return readFileSync(path).toString('base64');
}
