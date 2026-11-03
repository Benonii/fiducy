import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIRECTORY = join(import.meta.dir, '../.vercel/output');
const FUNCTION_DIRECTORY = join(OUTPUT_DIRECTORY, 'functions/index.func');

const functionConfig = {
  runtime: 'bun1.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
  maxDuration: 300
};

const routingConfig = {
  version: 3,
  routes: [{ src: '/(.*)', dest: '/index' }]
};

const entrySource = `import { handleVercelRequest } from './gateway.mjs';
export default { fetch: handleVercelRequest };
`;

rmSync(OUTPUT_DIRECTORY, { recursive: true, force: true });
mkdirSync(FUNCTION_DIRECTORY, { recursive: true });

const result = await Bun.build({
  entrypoints: [join(import.meta.dir, '../src/vercel.ts')],
  target: 'bun',
  format: 'esm',
  naming: 'gateway.mjs',
  outdir: FUNCTION_DIRECTORY
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

writeFileSync(join(FUNCTION_DIRECTORY, 'index.mjs'), entrySource);
writeFileSync(join(FUNCTION_DIRECTORY, '.vc-config.json'), JSON.stringify(functionConfig, null, 2));
writeFileSync(join(OUTPUT_DIRECTORY, 'config.json'), JSON.stringify(routingConfig, null, 2));
console.log(`Gateway function written to ${FUNCTION_DIRECTORY}`);
