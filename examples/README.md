# Fiducy examples

One small app per framework, each wired the way the docs describe. The same flow runs against every app in the browser (`bun run test:examples`): sign in, connect a key in `<fiducy-key>`, ask the model, then lose the key at the gateway and watch the app ask for it again.

| Example | Server helper | Key box |
| --- | --- | --- |
| `next` | `toNextJsHandler` from `@fiducy/sdk/next` | `FiducyKey` from `@fiducy/sdk/react` |
| `tanstack-start` | `toTanStackHandlers` from `@fiducy/sdk/tanstack` | `FiducyKey` from `@fiducy/sdk/react` |
| `react-router` | `toReactRouterHandlers` from `@fiducy/sdk/react-router` | `FiducyKey` from `@fiducy/sdk/react` |
| `sveltekit` | `svelteKitHandler` from `@fiducy/sdk/sveltekit` | `use:fiducyKey` from `@fiducy/sdk/svelte` |
| `nuxt` | `toNuxtHandler` from `@fiducy/sdk/nuxt` | `FiducyKey` from `@fiducy/sdk/vue` |
| `express` | `toNodeHandler` from `@fiducy/sdk/node` | `<fiducy-key>` from `@fiducy/sdk/element` |
| `farm` | `fiducy()` from `@fiducy/farm` | `FiducyKey` from `@fiducy/sdk/react` |

`@fiducy/example-kit` stands in for your own auth and storage: a signed test-user cookie and a JSON file. Replace both with your real ones.

## Run one

1. Start a local gateway and copy the three `FIDUCY_` values it prints.
2. `cp .env.example .env` in the example folder and fill it in.
3. `bun install` at the repository root, then `bun run dev` in the example folder.
