import {AxiosInstance} from "axios"
import {
    Allocation,
    AllocationRel
} from "@/api/application/types/server_allocation"
import {GenericListResponse, GenericResponse} from "@/api/base/types"
import z from "zod"

export class NodesAllocations {
    private readonly r: AxiosInstance
    private readonly id: number

    constructor(requester: AxiosInstance, id: number) {
        this.r = requester
        this.id = id
    }

    list = async (
        include?: ("node" | "server")[]
    ): Promise<AllocationRel[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<AllocationRel, "allocation">>
        >(`/nodes/${this.id}/allocations`, {
            params: {include: include?.join(",")}
        })

        return data.data.map(d => d.attributes)
    }

    create = async (
        ip: string,
        ports: string[],
        alias?: string
    ): Promise<void> => {
        z.ipv4().parse(ip)
        z.ipv4().or(z.url().max(255)).optional().parse(alias)
        z.array(z.number())
            .or(z.string().regex(/\d+-\d+/))
            .parse(ports)

        await this.r.post(`/nodes/${this.id}/allocations`, {ip, ports, alias})
    }

    delete = async (alloc_id: number): Promise<void> => {
        await this.r.delete(`/nodes/${this.id}/allocations/${alloc_id}`)
    }
}
