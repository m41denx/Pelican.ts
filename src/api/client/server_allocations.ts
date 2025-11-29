import type {AxiosInstance} from "axios"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {ServerAllocation} from "@/api/client/types/server_allocation"

export class ServerAllocations {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (): Promise<ServerAllocation[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ServerAllocation, "allocation">>
        >(`/servers/${this.id}/network/allocations`)
        return data.data.map(r => r.attributes)
    }

    autoAssign = async (): Promise<ServerAllocation> => {
        const {data} = await this.r.post<
            GenericResponse<ServerAllocation, "allocation">
        >(`/servers/${this.id}/network/allocations`)
        return data.attributes
    }

    setNotes = async (
        alloc_id: number,
        notes: string
    ): Promise<ServerAllocation> => {
        const {data} = await this.r.post<
            GenericResponse<ServerAllocation, "allocation">
        >(`/servers/${this.id}/network/allocations/${alloc_id}`, {notes})
        return data.attributes
    }

    setPrimary = async (alloc_id: number): Promise<ServerAllocation> => {
        const {data} = await this.r.post<
            GenericResponse<ServerAllocation, "allocation">
        >(`/servers/${this.id}/network/allocations/${alloc_id}/primary`)
        return data.attributes
    }

    unassign = async (alloc_id: number): Promise<void> => {
        await this.r.delete(
            `/servers/${this.id}/network/allocations/${alloc_id}`
        )
    }
}
