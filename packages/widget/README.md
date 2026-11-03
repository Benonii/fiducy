# @fiducy/widget

Browser client that mounts the [Fiducy](https://github.com/fiducy-dev/fiducy) key widget iframe and hands your page the key handle. `@fiducy/sdk/react` wraps it in a React component; use this package directly with other frameworks.

```sh
bun add @fiducy/widget
```

```ts
import { mountKeyWidget } from '@fiducy/widget';

const widget = mountKeyWidget({
  gatewayURL: 'https://gw.example.com',
  appID: 'app_...',
  container: document.getElementById('key-box'),
  onHandle: (handle) => saveHandle(handle)
});

widget.unmount();
```

See [React](https://fiducy.dev/docs/react) for the component version.
