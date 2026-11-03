---
'@fiducy/sdk': minor
---

`ConnectKeyWidget` no longer needs TanStack Query: it saves with plain `fetch` and works without a `QueryClientProvider`, which also fixes the "No QueryClient set" crash in `@fiducy/assistant-ui`'s key tool. `useFiducyKeys` and `fiducyKeysQueryKey` moved to the new `@fiducy/sdk/react-query` entry (breaking: update imports from `@fiducy/sdk/react`); the hook refreshes itself when the widget saves a key. New `saveConnectedKey()` and `FIDUCY_KEYS_CHANGED` exports for custom flows.
