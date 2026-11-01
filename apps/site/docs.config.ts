import { defineDocs } from '@farming-labs/docs';
import { pixelBorder } from '@farming-labs/theme/pixel-border';

export default defineDocs({
  entry: 'docs',
  contentDir: 'docs',
  theme: pixelBorder(),
  nav: { title: 'FIDUCY', url: '/' },
  github: 'https://github.com/Benonii/fiducy',
  ordering: 'numeric',
  themeToggle: { default: 'light' },
  feedback: false,
  telemetry: false,
  analytics: false
});
