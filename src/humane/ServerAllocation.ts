import type { ServerClient } from "@/api/client/server"
import type { ServerAllocation as ServerAllocationT } from "@/api/client/types/server_allocation"
import type { Nullable } from "@/utils/types"

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
        this.alias = alloc.alias
        this.id = alloc.id
        this.ip = alloc.ip
        this.$isDefault = alloc.is_default
        this.$notes = alloc.notes
        this.port = alloc.port
    }

    setNotes = async (notes: string) => {
        const data = await this.client.allocations.setNotes(this.id, notes)
        this.$notes = data.notes
    }

    makeDefault = async () => {
        const data = await this.client.allocations.setPrimary(this.id)
        this.$isDefault = data.is_default
    }

    unassign = async () => this.client.allocations.unassign(this.id)
}
