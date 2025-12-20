import type {Client as ClientT} from "@/api/client/client"
import {Account} from "@/humane/Account"
import {Server} from "@/humane/Server"

/**
 * Pelican User Client
 *
 * @class
 * @param client Pelican API Client
 */
export class Client {
    private readonly client: ClientT

    constructor(client: ClientT) {
        this.client = client
    }

    /**
     * Get raw API client
     */
    get $client(): ClientT {
        return this.client
    }

    /**
     * Get user account
     */
    getAccount = async () => {
        const user = await this.client.account.info()
        return new Account(this.client, user)
    }

    /**
     * Get subuser (current user) permissions
     *
     * Return data is not compatible with subusers API
     */
    listPermissions = async () => this.client.listPermissions()

    /**
     * List servers
     *
     * @param opts Filtering options (all optional)
     *
     * @remarks
     * `type` — Server access type (Default: accessible)
     *
     * Variants:
     * - `accessible` — your servers and servers you have access to as a subuser
     * - `mine` — only your servers
     * - `admin` — only servers you have admin access to (excluding yours)
     * - `admin-all` — all servers you have admin access to
     */
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

    /**
     * Get server by UUID
     *
     * @param uuid Server UUID
     * @param include Include additional data
     */
    getServer = async (uuid: string, include?: ("egg" | "subusers")[]) => {
        const server = await this.client.server(uuid).info(include)
        return new Server(this.client.server(uuid), server)
    }
}
