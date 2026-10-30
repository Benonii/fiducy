import { readFileSync } from 'node:fs';

export function readWidgetFontBase64(): string {
  const path = Bun.resolveSync(
    '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
    import.meta.dir
  );
  return readFileSync(path).toString('base64');
}
