---
'@fiducy/providers': patch
---

Count token usage for OpenAI Responses API streams (`response.completed`), so monthly request limits and dashboard usage include apps that call `openai(...)` or `.responses(...)` through the gateway.
