# @fiducy/providers

Provider adapters for the [Fiducy](https://github.com/Benonii/fiducy) gateway: swaps the key handle for the real key header, allows only known provider paths, redacts secrets from error bodies and reads token usage from streamed responses. Covers OpenAI, Anthropic, Gemini and OpenRouter.

```sh
bun add @fiducy/providers
```

```ts
import { buildUpstreamRequest, createProviderRegistry, relayResponse } from '@fiducy/providers';
```

Used by the gateway in `apps/gateway`. See the [Gateway API](https://fiducy.dev/docs/gateway-api).
