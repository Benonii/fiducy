# @fiducy/sdk

App SDK for [Fiducy](https://github.com/Benonii/fiducy) key custody. `@fiducy/sdk/server` gives you `createFiducy()`: a route handler, `providerSettings()` for the AI SDK, and list, save and revoke for the signed-in user's keys. `@fiducy/sdk/react` gives you `<ConnectKeyWidget />` and `useFiducyKeys()`.

```sh
bun add @fiducy/sdk
```

```ts
import { createFiducy, keyValueStorage } from '@fiducy/sdk/server';

export const fiducy = createFiducy({ gatewayURL, appSecret, storage: keyValueStorage(driver), getUserID });
```

Docs: [Server SDK](https://fiducy.dev/docs/server), [React](https://fiducy.dev/docs/react), [Storage](https://fiducy.dev/docs/storage).
