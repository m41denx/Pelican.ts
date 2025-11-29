import type {AxiosInstance} from "axios"
import z from "zod"
import type {ApplicationServer} from "@/api/application/types"
import type {Egg} from "@/api/application/types/egg"
import type {Mount} from "@/api/application/types/mount"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"

export class Mounts {
    private readonly r: AxiosInstance

    constructor(r: AxiosInstance) {
        this.r = r
    }

    list = async (): Promise<Mount[]> => {
        const {data} =
            await this.r.get<
                GenericListResponse<GenericResponse<Mount, "mount">>
            >("/mounts")
        return data.data.map(d => d.attributes)
    }

    info = async (id: number): Promise<Mount> => {
        const {data} = await this.r.get<GenericResponse<Mount, "mount">>(
            `/mounts/${id}`
        )
        return data.attributes
    }

    create = async (
        opts: z.infer<typeof CreateMountSchema>
    ): Promise<Mount> => {
        opts = CreateMountSchema.parse(opts)
        const {data} = await this.r.post<GenericResponse<Mount, "mount">>(
            "/mounts",
            opts
        )
        return data.attributes
    }

    update = async (
        id: number,
        opts: z.infer<typeof CreateMountSchema>
    ): Promise<Mount> => {
        opts = CreateMountSchema.parse(opts)
        const {data} = await this.r.patch<GenericResponse<Mount, "mount">>(
            `/mounts/${id}`,
            opts
        )
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        await this.r.delete(`/mounts/${id}`)
    }

    listAssignedEggs = async (id: number): Promise<Egg[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Egg, "egg">>
        >(`/mounts/${id}/eggs`)
        return data.data.map(d => d.attributes)
    }

    assignEggs = async (id: number, eggs: number[]): Promise<void> => {
        await this.r.post(`/mounts/${id}/eggs`, {eggs})
    }

    unassignEgg = async (id: number, egg_id: number): Promise<void> => {
        await this.r.delete(`/mounts/${id}/eggs/${egg_id}`)
    }

    listAssignedNodes = async (id: number): Promise<Node[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Node, "node">>
        >(`/mounts/${id}/nodes`)
        return data.data.map(d => d.attributes)
    }

    assignNodes = async (id: number, nodes: number[]): Promise<void> => {
        await this.r.post(`/mounts/${id}/nodes`, {nodes})
    }

    unassignNode = async (id: number, node_id: number): Promise<void> => {
        await this.r.delete(`/mounts/${id}/nodes/${node_id}`)
    }

    listAssignedServers = async (id: number): Promise<ApplicationServer[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ApplicationServer, "server">>
        >(`/mounts/${id}/servers`)
        return data.data.map(d => d.attributes)
    }

    assignServers = async (id: number, servers: number[]): Promise<void> => {
        await this.r.post(`/mounts/${id}/servers`, {servers})
    }

    unassignServer = async (id: number, server_id: number): Promise<void> => {
        await this.r.delete(`/mounts/${id}/servers/${server_id}`)
    }
}

const CreateMountSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    source: z.string(),
    target: z.string(),
    read_only: z.boolean().optional()
})
