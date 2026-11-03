# @fiducy/core

Crypto core for [Fiducy](https://github.com/fiducy-dev/fiducy): AES-256-GCM sealed records, split data keys, key handles and the `KeyWrapper` interface the gateway uses to wrap data keys with KMS. WebCrypto only, so it runs in browsers, Node and Bun.

```sh
bun add @fiducy/core
```

```ts
import { createHandle, openSecret, parseHandle, sealSecret } from '@fiducy/core';
```

Most apps do not use this package directly; `@fiducy/sdk` depends on it. See [How it works](https://fiducy.dev/docs/how-it-works).
