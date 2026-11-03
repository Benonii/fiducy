export const AGENT_SETUP_PROMPT = `Set up Fiducy in this app so users can bring their own AI provider keys (OpenAI, Anthropic, Gemini, OpenRouter) without the app ever storing or seeing a raw key.

Read these first, they are the source of truth:
- https://fiducy.dev/docs/quickstart.md
- https://fiducy.dev/docs/server.md
- https://fiducy.dev/docs/react.md
- https://fiducy.dev/docs/storage.md
- https://fiducy.dev/docs/farm.md (only if this is a Farm.js app)
- https://fiducy.dev/docs/assistant-ui.md (only if the app uses assistant-ui)

Security rules. Follow all of them, even if it means leaving a step to me:
1. Never ask me to paste FIDUCY_APP_SECRET (fsk_...) into this chat, and never write it into a file that is committed. Add placeholders to .env.example, make sure .env files are gitignored, and tell me which env vars to set myself.
2. The app secret is server only. Never give it a client-exposed prefix (VITE_, NEXT_PUBLIC_, PUBLIC_) or import the server module from client code. Only the app ID and gateway URL may reach the browser.
3. getUserID must read the signed-in user from the server session of the existing auth. Never trust a user ID from the request body, query or a client-set header. Return null when nobody is signed in.
4. Users enter keys only in Fiducy's key widget (ConnectKeyWidget or mountKeyWidget). Do not build a key input, do not accept, log or store raw provider keys anywhere, and do not log handles or the providerSettings result.
5. Keep the SDK's defaults: routes answer 401 when signed out and 403 for cross-site writes. Do not loosen CORS or origin checks.
6. Use storage that survives restarts in production (the app's database or a persistent key-value store). memoryStorage is for tests only.

Steps:
1. Inspect the project: framework, package manager, auth library, database, tsconfig path aliases, UI library, and every place that calls a model (AI SDK, an official provider SDK, or plain fetch). Summarize what you found before changing code.
2. Install @fiducy/sdk. Add @fiducy/widget if the UI is not React, @fiducy/farm only on Farm.js, @fiducy/assistant-ui only with assistant-ui. If the packages cannot be installed, stop and tell me.
3. Add FIDUCY_GATEWAY_URL, FIDUCY_APP_ID and FIDUCY_APP_SECRET to .env.example with placeholder values. The widget needs the app ID and gateway URL in the browser: pass them from server code, or add public copies with the framework's public prefix. Never the secret.
4. Create the server instance in one server-only module (for example lib/fiducy.ts) with createFiducy, a storage adapter and getUserID. Throw if the env vars are missing. For storage, use the app's database (one table, see the storage page) or an unstorage driver. On Farm.js, follow the Farm.js page.
5. Mount fiducy.handler for GET, POST and DELETE under /api/fiducy, using the quickstart's example for this framework (or the @fiducy/farm integration on Farm.js).
6. Add the key widget to the settings page (or the closest equivalent; create one if needed), with a list of saved keys and a way to remove them. React: ConnectKeyWidget from @fiducy/sdk/react. Other UIs: mountKeyWidget from @fiducy/widget. For the list, use useFiducyKeys from @fiducy/sdk/react-query only if the app already uses TanStack Query; otherwise call GET and DELETE on /api/fiducy/keys as the React page shows. Do not add TanStack Query just for Fiducy.
7. If the app uses assistant-ui, register fiducyToolkit in the thread and answer requestKey from the chat route when providerSettings returns null, as the assistant-ui page shows.
8. Switch every model call that should use the user's key to the settings from fiducy.providerSettings(provider, { userID }), whatever library makes the call (the quickstart shows the AI SDK, the OpenAI SDK and plain fetch). When it returns null, respond with a clear "connect your key" message instead of falling back to an app-owned key.
9. Run the typecheck, lint and tests. Start the app and confirm GET /api/fiducy/keys answers 401 when signed out.

When you are done, give me a short report: files changed, and what I still have to do myself:
- create the app in the Fiducy dashboard
- add my dev and production origins to its allowed origins
- set the three env vars locally and on my host (for local testing, the gateway from \`bun run prototype --mock\` is http://localhost:8787)
- connect a test key in the browser and send one message`;
