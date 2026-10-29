# Fiducy

Key custody for bring-your-own-key apps. Users paste their AI provider key into an embedded Fiducy widget, the app stores only a handle, and every AI call goes through the Fiducy gateway, which decrypts the key in memory, forwards the request and streams the response back. The app never stores user keys, and neither does Fiducy's database.

## Layout

| Path | What it is |
|---|---|
| `packages/core` | Crypto core: AES-256-GCM sealing, split data keys, handles, key wrapping |
| `packages/providers` | Provider adapters: header swap, path allowlist, error redaction, streaming usage |
| `packages/widget` | Browser client that mounts the key widget iframe |
| `packages/testing` | Shared fixtures and a mock AI provider |
| `apps/gateway` | The gateway server |

## Development

```sh
bun install
bun test
bun run typecheck
bun run lint
```
