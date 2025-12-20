import type {ServerClient} from "@/api/client/server"
import type {ServerAllocation as ServerAllocationT} from "@/api/client/types/server_allocation"
import type {Nullable} from "@/utils/types"

/**
 * Instance of a Humane Pelican Server Allocation
 *
 * @class
 * @example
 * You can create allocation from a raw client
 * ```ts
 * import {PelicanAPIClient} from "@pelican.ts/sdk/api"
 * const client = new PelicanAPIClient(...)
 * const allocData = await client.account.server(...).allocations.list()
 * const alloc = new ServerAllocation(client, allocData[0])
 * ```
 */
export class ServerAllocation {
    private readonly client: ServerClient
    readonly alias: Nullable<string>
    readonly id: number
    readonly ip: string
    private $isDefault: boolean
    get isDefault() {
        return this.$isDefault
    }
    private $notes: Nullable<string>
    get notes() {
        return this.$notes
    }
    readonly port: number

    constructor(client: ServerClient, alloc: ServerAllocationT) {
        this.client = client
        this.alias = alloc.ip_alias
        this.id = alloc.id
        this.ip = alloc.ip
        this.$isDefault = alloc.is_default
        this.$notes = alloc.notes
        this.port = alloc.port
    }

    /**
     * Set description for this allocation
     * @param notes
     */
    setNotes = async (notes: string) => {
        const data = await this.client.allocations.setNotes(this.id, notes)
        this.$notes = data.notes
    }

    /**
     * Make port primary
     */
    makeDefault = async () => {
        const data = await this.client.allocations.setPrimary(this.id)
        this.$isDefault = data.is_default
    }

    /**
     * Remove allocation (if user is allowed to manage allocations by themselves)
     */
    unassign = async () => this.client.allocations.unassign(this.id)
}
