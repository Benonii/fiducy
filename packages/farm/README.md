# @fiducy/farm

Farm.js integration for [Fiducy](https://github.com/fiducy-dev/fiducy). Mounts the SDK's route handler at `/api/fiducy/*`.

```sh
bun add @fiducy/sdk @fiducy/farm
```

```ts
import { fiducy } from '@fiducy/farm';

export default defineConfig({ integrations: { byok: fiducy({ instance }) } });
```

See the [Quickstart](https://fiducy.dev/docs/quickstart).
