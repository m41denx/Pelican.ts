<h1 align="center">
    <img src=".github/logo.png" width="420" />
</h1>

# Pelican.ts Typescript Client for Pelican panel

## Installation

## Usage
```ts
import { PterodactylClient } from "pelican.ts"
const client = new PterodactylClient("https://pterodactyl.io", "token")

const main = async () => {
    const servers = await client.listServers()
    const serverID = servers[0].identifier // babcaed0 for example
    const db = await client.server(serverID).databases.list(["password"])[0] // including password
    console.log(`Well isn't this the mighty ${db.name} from ${db.host.address}!`)
    await client.server(serverID).databases.rotatePassword(db.id)
}

main()
```

What's done:
- [X] Client
- [ ] Application
  - [X] Users
  - [X] Nodes
    - [X] Allocations
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
of its contributors stated below. Pelican.ts is not endorsed by or affiliated with Pterodactyl® team.

## Contributors
[M41den](https://github.com/m41denx) © 2024-2025