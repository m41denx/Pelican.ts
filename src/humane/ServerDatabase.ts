import type { ServerClient } from "@/api/client/server"
import type { ServerDatabase as ServerDatabaseT } from "@/api/common/types/server_database"
// TODO: Check for validity

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

    rotatePassword = async () => {
        const data = await this.client.databases.rotatePassword(this.id)
        this.$password = data.relationships?.password.attributes.password
    }

    delete = async () => this.client.databases.delete(this.id)
}
