import { defineDocs } from '@farming-labs/docs';
import { pixelBorder } from '@farming-labs/theme/pixel-border';

const docsConfig = defineDocs({
  entry: 'docs',
  contentDir: 'docs',
  theme: pixelBorder(),
  nav: { title: 'FIDUCY', url: '/' },
  github: 'https://github.com/fiducy-dev/fiducy',
  ordering: 'numeric',
  themeToggle: { default: 'light' },
  feedback: false,
  telemetry: false,
  analytics: false
});

// defineDocs drops keys it doesn't list; the Farm docs runtime still reads favicon.
export default { ...docsConfig, favicon: '/favicon.svg' };
