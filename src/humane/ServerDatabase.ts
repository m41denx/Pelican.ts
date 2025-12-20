import type {ServerClient} from "@/api/client/server"
import type {ServerDatabase as ServerDatabaseT} from "@/api/common/types/server_database"

/**
 * Instance of a Humane Pelican Server Database
 *
 * @class
 * @example
 * You can create account from a raw client
 * ```ts
 * import {PelicanAPIClient} from "@pelican.ts/sdk/api"
 * const client = new PelicanAPIClient(...)
 * const dbData = await client.account.server(...).databases.info(...)
 * const database = new ServerDatabase(client, dbData)
 * ```
 */
export class ServerDatabase {
    private readonly client: ServerClient
    readonly allowConnectionsFrom: string
    readonly host: string
    readonly port: number
    readonly id: string
    readonly maxConnections: number
    readonly name: string
    private $password?: string
    get password() {
        return this.$password
    }
    readonly username: string

    constructor(client: ServerClient, database: ServerDatabaseT) {
        this.client = client
        this.allowConnectionsFrom = database.connections_from
        this.host = database.host.address
        this.port = database.host.port
        this.id = database.id
        this.maxConnections = database.max_connections
        this.name = database.name
        this.$password = database.relationships?.password.attributes.password
        this.username = database.username
    }

    /**
     * Reset password to a random one, password will be updated in this ServerDatabase instance
     */
    rotatePassword = async () => {
        const data = await this.client.databases.rotatePassword(this.id)
        this.$password = data.relationships?.password.attributes.password
    }

    delete = async () => this.client.databases.delete(this.id)
}
