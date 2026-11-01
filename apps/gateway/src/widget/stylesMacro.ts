import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { compile } from 'tailwindcss';

const WIDGET_SOURCE_FILES = ['page.ts', 'script.ts'];
const CANDIDATE_PATTERN = /[^\s"'`<>${}]+/g;

function loadStylesheet(id: string, base: string) {
  const path = Bun.resolveSync(id, base);
  return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
}

function readCandidates(): string[] {
  const sources = WIDGET_SOURCE_FILES.map((file) =>
    readFileSync(`${import.meta.dir}/${file}`, 'utf8')
  );
  return [...new Set(sources.join('\n').match(CANDIDATE_PATTERN) ?? [])];
}

export async function buildWidgetStyles(): Promise<string> {
  const input = readFileSync(`${import.meta.dir}/widget.css`, 'utf8');
  const compiler = await compile(input, {
    base: import.meta.dir,
    loadStylesheet: async (id, base) => loadStylesheet(id, base)
  });
  return compiler.build(readCandidates());
}
