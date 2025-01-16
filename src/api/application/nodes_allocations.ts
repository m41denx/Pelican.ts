import {AxiosInstance} from "axios";
import {Allocation, AllocationRel} from "@/api/common/types/server_allocations";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import z from "zod";


export class NodesAllocations {
    private readonly r: AxiosInstance
    private readonly id: number

    constructor(requester: AxiosInstance, id: number) {
        this.r = requester
        this.id = id
    }

    list = async (include?: ("node" | "server")[]): Promise<AllocationRel[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<AllocationRel, "allocation">>
        >(`/application/nodes/${this.id}/allocations`, {
            params: {include: include?.join(",")}
        })

        return data.data.map(d => d.attributes)
    }

    create = async (
        ip: string,
        ports: number[] | string,
        alias?: string
    ): Promise<void> => {
        z.string().ip().parse(ip)
        z.string().ip().or(z.string().url()).optional().parse(alias)
        z.array(z.number()).or(z.string().regex(/\d+-\d+/)).parse(ports)

        await this.r.post(`/application/nodes/${this.id}/allocations`, {
            ip,
            ports,
            alias
        })
    }

    delete = async (alloc_id: number): Promise<void> => {
        await this.r.delete(`/application/nodes/${this.id}/allocations/${alloc_id}`)
    }
}