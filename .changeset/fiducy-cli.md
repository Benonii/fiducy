---
"fiducy": minor
"@fiducy/sdk": minor
---

New `fiducy` CLI: `fiducy init` adds Fiducy to an existing app with new files only, `fiducy dev` runs a local gateway whose keys survive restarts, and `fiducy generate` and `fiducy migrate` create the storage table. `sendWebResponse` now streams and keeps every cookie, and Drizzle and Prisma storage find their table on first use, so the CLI can load your server module before the table exists.
