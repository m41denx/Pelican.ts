<h1 align="center">
    <img src=".github/logo.png" width="420" />
</h1>

# Pterodactyl.ts Typescript Client for Pterodactyl
> [!IMPORTANT]
> This library attempts to follow [Official Pterodactyl API Docs @Dashflo](https://dashflo.net/docs/api/pterodactyl/v1)
> as closely as possible, but is not maintained by Pterodactyl team.

## Installation
> [!WARNING]
> **This library is still in development and is not ready for production use**

## Usage
```ts
import { PterodactylClient } from "pterodactyl.ts"
const client = new PterodactylClient("https://pterodactyl.io", "token")

const main = async () => {
    const servers = await client.listServers()
    const serverID = servers[0].identifier // babcaed0 for example
    const db = await client.server(serverID).databases.list(["password"]) // including password
    console.log(`Well isn't this the mighty ${db.name} from ${db.host.address}!`)
    await client.server(serverID).databases.rotatePassword(db.id)
}

main()
```

What's done:
- [ ] Client
  - [X] Account
  - [ ] Server
    - [X] Databases
    - [X] File Manager
    - [X] Schedules
    - [ ] Network
    - [ ] Users
    - [ ] Backups
    - [ ] Startup
    - [ ] Settings
- [ ] Application
  - [ ] Users
  - [ ] Nodes
    - [ ] Allocations
  - [ ] Locations
  - [ ] Servers
    - [ ] Databases
  - [ ] Nests
    - [ ] Eggs
- [ ] TSDoc
- [ ] Examples
- [ ] Tests
- [ ] Documentation
- [ ] Humane wrapper

## Copyright Notice
[Pterodactyl®](https://github.com/pterodactyl) is a registered trademark of Dane Everitt and contributors.

Pterodactyl.ts is Open Source under the [GNU v3.0 License](LICENSE) and is the copyright
of its contributors stated below. Pterodactyl.ts is not endorsed by or affiliated with Pterodactyl® team.

## Contributors
[M41den](https://github.com/m41denx) © 2024