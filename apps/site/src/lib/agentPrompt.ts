export const AGENT_SETUP_PROMPT = `Set up Fiducy in this app so users can bring their own AI provider keys (OpenAI, Anthropic, Gemini, OpenRouter) without the app ever storing or seeing a raw key.

Read these first, they are the source of truth:
- https://fiducy-nine.vercel.app/docs/quickstart.md
- https://fiducy-nine.vercel.app/docs/server.md
- https://fiducy-nine.vercel.app/docs/react.md
- https://fiducy-nine.vercel.app/docs/storage.md

Security rules. Follow all of them, even if it means leaving a step to me:
1. Never ask me to paste FIDUCY_APP_SECRET (fsk_...) into this chat, and never write it into a file that is committed. Add placeholders to .env.example, make sure .env files are gitignored, and tell me which env vars to set myself.
2. The app secret is server only. Never give it a client-exposed prefix (VITE_, NEXT_PUBLIC_, PUBLIC_) or import the server module from client code. Only the app ID and gateway URL may reach the browser.
3. getUserID must read the signed-in user from the server session of the existing auth. Never trust a user ID from the request body, query or a client-set header. Return null when nobody is signed in.
4. Users enter keys only in Fiducy's ConnectKeyWidget. Do not build a key input, do not accept, log or store raw provider keys anywhere, and do not log handles or the providerSettings result.
5. Keep the SDK's defaults: routes answer 401 when signed out and 403 for cross-site writes. Do not loosen CORS or origin checks.
6. Use storage that survives restarts in production (the app's database or a persistent key-value store). memoryStorage is for tests only.

Steps:
1. Inspect the project: framework, package manager, auth library, database, tsconfig path aliases, and any existing AI SDK model calls. Summarize what you found before changing code.
2. Install @fiducy/sdk, plus @fiducy/farm if this is a Farm.js app, and @tanstack/react-query if missing. If the packages cannot be installed, stop and tell me.
3. Add FIDUCY_GATEWAY_URL, FIDUCY_APP_ID and FIDUCY_APP_SECRET to .env.example with placeholder values.
4. Create the server instance in one module (for example src/lib/fiducy.ts) with createFiducy, the storage adapter and getUserID. Throw at startup if the env vars are missing.
5. Mount the key routes: the @fiducy/farm integration on Farm.js, otherwise fiducy.handler for GET, POST and DELETE under /api/fiducy.
6. Wrap the app in a QueryClientProvider if it does not have one.
7. Add ConnectKeyWidget and useFiducyKeys to the settings page (or the closest equivalent), with a way to remove a saved key.
8. Switch every model call that should use the user's key to fiducy.providerSettings(provider, { userID }). When it returns null, respond with a clear "connect your key" message instead of falling back to an app-owned key.
9. Run the typecheck, lint and tests. Start the app and confirm GET /api/fiducy/keys answers 401 when signed out.

When you are done, give me a short report: files changed, and what I still have to do myself:
- create the app in the Fiducy dashboard
- add my dev and production origins to its allowed origins
- set the three env vars locally and on my host
- connect a test key in the browser and send one message`;
