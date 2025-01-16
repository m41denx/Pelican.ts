import {AxiosInstance} from "axios";
import {Allocation} from "@/api/common/types/server";
import {GenericListResponse, GenericResponse} from "@/api/base/types";

export class ServerAllocations {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (): Promise<Allocation[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Allocation, "allocation">>
        >(`/client/servers/${this.id}/allocations`)
        return data.data.map(r => r.attributes)
    }

    autoAssign = async (): Promise<Allocation> => {
        const {data} = await this.r.post<
            GenericResponse<Allocation, "allocation">
        >(`/client/servers/${this.id}/allocations`)
        return data.attributes
    }

    setNotes = async (alloc_id: number, notes: string): Promise<Allocation> => {
        const {data} = await this.r.post<
            GenericResponse<Allocation, "allocation">
        >(`/client/servers/${this.id}/allocations/${alloc_id}`, {notes})
        return data.attributes
    }

    setPrimary = async (alloc_id: number): Promise<Allocation> => {
        const {data} = await this.r.post<
            GenericResponse<Allocation, "allocation">
        >(`/client/servers/${this.id}/allocations/${alloc_id}/primary`)
        return data.attributes
    }

    unassign = async (alloc_id: number): Promise<void> => {
        await this.r.delete(`/client/servers/${this.id}/allocations/${alloc_id}`)
    }
}