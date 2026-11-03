# @fiducy/sdk

## 0.2.0

### Minor Changes

- [#49](https://github.com/Benonii/fiducy/pull/49) [`cadb608`](https://github.com/Benonii/fiducy/commit/cadb608900c74760cec3c617c81b327ce1d73640) Thanks [@Benonii](https://github.com/Benonii)! - `ConnectKeyWidget` no longer needs TanStack Query: it saves with plain `fetch` and works without a `QueryClientProvider`, which also fixes the "No QueryClient set" crash in `@fiducy/assistant-ui`'s key tool. `useFiducyKeys` and `fiducyKeysQueryKey` moved to the new `@fiducy/sdk/react-query` entry (breaking: update imports from `@fiducy/sdk/react`); the hook refreshes itself when the widget saves a key. New `saveConnectedKey()` and `FIDUCY_KEYS_CHANGED` exports for custom flows.

### Patch Changes

- Updated dependencies []:
  - @fiducy/core@0.2.0
  - @fiducy/widget@0.2.0
