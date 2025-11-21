import type {Client as ClientT} from "@/api/client/client"
import {Account} from "@/humane/Account"
import {Server} from "@/humane/Server"

export class Client {
    private readonly client: ClientT

    constructor(client: ClientT) {
        this.client = client
    }

    get $client(): ClientT {
        return this.client
    }

    getAccount = async () => {
        const user = await this.client.account.info()
        return new Account(this.client, user)
    }

    listPermissions = async () => this.client.listPermissions()

    listServers = async (
        opts: {
            type?: "accessible" | "mine" | "admin" | "admin-all"
            page?: number
            per_page?: number
            include?: ("egg" | "subusers")[]
        } = {type: "accessible", page: 1, per_page: 50}
    ) => {
        const data = await this.client.listServers(
            opts.type,
            opts.page,
            opts.per_page,
            opts.include
        )
        return data.map(d => new Server(this.client.server(d.uuid), d))
    }

    getServer = async (uuid: string, include?: ("egg" | "subusers")[]) => {
        const server = await this.client.server(uuid).info(include)
        return new Server(this.client.server(uuid), server)
    }
}
