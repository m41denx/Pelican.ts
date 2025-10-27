<h1 align="center">
    <img src=".github/logo.png" width="420" />
</h1>

# Pelican.ts Typescript Client for Pelican panel

## Installation
```shell
npm install @pelican.ts/sdk
```

## Usage
```ts
import { PelicanClient } from "@pelican.ts/sdk"
const client = new PelicanClient("https://demo.pelican.dev", "token")

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
  - [X] Servers
    - [X] Databases (TODO: Check if server database type is valid)
  - [X] Database Hosts (TODO: find out why create API returns 500 No Route)
  - [X] Roles
  - [ ] Eggs
  - [ ] Mounts
- [ ] TSDoc
- [ ] Examples
- [ ] Tests
- [ ] Documentation
- [ ] Humane wrapper

## Copyright Notice
[Pterodactyl®](https://github.com/pterodactyl) is a registered trademark of Dane Everitt and contributors.

[Pelican®](https://github.com/pelican-dev) is a registered trademark of Pelican contributors.

Pelican.ts is Open Source under the [MIT License](LICENSE) and is the copyright
of its contributors stated below. Pelican.ts is not endorsed by or affiliated with Pterodactyl® nor Pelican® team.


## Contributors
[M41den](https://github.com/m41denx) © 2024-2025