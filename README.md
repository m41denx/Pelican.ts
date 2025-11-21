<h1 align="center">
    <img src=".github/logo.png" width="420" />
</h1>

# Pelican.ts — Typescript client for Pelican panel

## 🧭 Installation
```shell
npm install @pelican.ts/sdk
```

## 📦 What's inside?
### 🤗 Humane Client `@pelican.ts/sdk`
**Humane Client** is an object-oriented client that provides a more comfortable experience. Each method corresponds to 
an API endpoint, so each update causes only one request. Objects are updated automatically after each API call.

I found the most use of it for file management, as each ServerFile knows exactly where is it located and what is its 
parent folder, so you don't have to use `PelicanAPIClient`, `currentDir` and `FileObject` to achieve simple file operations.

Also, each Humane object can be created from API client and corresponding API data object:
```ts
import { ServerBackup } from "@pelican.ts/sdk"
const backup = new ServerBackup(serverClient, backupObject)
````

**Usage:**
```ts
import { createPelicanClient } from "@pelican.ts/sdk"
const client = createPelicanClient("https://demo.pelican.dev", "token")

// Create server backup and restore it
const main = async () => {
    const servers = await client.listServers()
    const myServer = servers[0]
    if (myServer.isInstalling || myServer.isSuspended)
        return
    const backup = await myServer.createBackup({
        name: "first backup",
        is_locked: false,
        ignored_files: ["/dynmap/*"]
    })
    setTimeout(
        async () => {
            await backup.restore()
        }, 60000
    )
}

main()
```


### 🤖 API Client `@pelican.ts/sdk/api`
**API Client** takes a more functional approach, consider it a direct API wrapper. It's stateless and doesn't save objects
for you. Uses zod for input validation.

**Usage:**
```ts
import { PelicanAPIClient } from "@pelican.ts/sdk/api"
const client = new PelicanAPIClient("https://demo.pelican.dev", "token")
// API client is also obtainable from Humane Client via createPelicanClient(...).$client

// Create server backup and restore it
const main = async () => {
    const servers = await client.listServers()
    const serverID = servers[0].identifier // babcaed0 for example
    const db = await client.server(serverID).databases.list(["password"])[0] // including password
    console.log(`Well isn't this the mighty ${db.name} from ${db.host.address}!`)
    await client.server(serverID).databases.rotatePassword(db.id)
}

main()
```

### 📚 Types `@pelican.ts/sdk/types`
Contains every API response type
```ts
import type {ApplicationServer, ServerBackup} from "@pelican.ts/sdk/types"

const backup: ServerBackup = {
    ...
}
```


**What's done:**
- [X] Client
- [X] Application
- [ ] TSDoc
- [ ] Examples
- [ ] Tests
- [ ] Documentation
- [X] Humane wrapper

## 🧐 Copyright Notice
[Pterodactyl®](https://github.com/pterodactyl) is a registered trademark of Dane Everitt and contributors.

[Pelican®](https://github.com/pelican-dev) is a registered trademark of Pelican contributors.

Pelican.ts is Open Source under the [MIT License](LICENSE) and is the copyright
of its contributors stated below. Pelican.ts is not endorsed by or affiliated with Pterodactyl® nor Pelican® team.


## 🧑‍💻 Contributors
[M41den](https://github.com/m41denx) © 2024-2025