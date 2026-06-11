# @pelican.ts/ai

Vercel [AI SDK](https://sdk.vercel.ai/) v6 tools for the Pelican panel **Client API** (`PelicanAPIClient`).

## Installation

```shell
npm install @pelican.ts/ai @pelican.ts/sdk ai
```

Peer dependencies: `ai@^6`, `@pelican.ts/sdk@^0.5.0`.

## Usage

```ts
import {PelicanAPIClient} from "@pelican.ts/sdk/api"
import {
    createPelicanClientTools,
    createPelicanServerTools
} from "@pelican.ts/ai"
import {generateText, stepCountIs} from "ai"

const client = new PelicanAPIClient("https://panel.example.com", "ptlc_...")

// All client API tools (~69). Server-scoped tools require `serverUuid` in each call.
const tools = createPelicanClientTools(client, {
    exclude: ["pelican_client_server_settings_reinstall"]
})

// Or bind a single server (inputs omit `serverUuid`)
const serverTools = createPelicanServerTools(client, "abc12345")

await generateText({
    model: "anthropic/claude-sonnet-4",
    tools: {...tools, ...serverTools},
    stopWhen: stepCountIs(10),
    prompt: "List my servers and show resource usage for the first one"
})
```

## Tool coverage

- Account, API keys, SSH keys
- Server info, power, console command, resources
- Files, databases, backups, schedules, allocations, subusers, startup, settings, activity

**Not included:** WebSocket console streaming (`ServerWebsocket`), Application API.

## Binary data

- `server_files_download` and `server_backups_download` return `{ base64, byteLength }`.
- `server_files_upload` accepts `{ filename, contentBase64, root? }`.

## Development

From the monorepo root:

```shell
bun run build:api          # build SDK types used by this package
cd packages/ai && bun run build
bun test                   # in packages/ai
```

Regenerate bindings after Client API changes:

```shell
bun run generate-ai-tools
```
