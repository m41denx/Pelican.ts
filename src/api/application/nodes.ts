import {AxiosInstance} from "axios";
import {NodesAllocations} from "@/api/application/nodes_allocations";
import {ApplicationServer} from "@/api/application/types/server";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import z from "zod";
import {Node, NodeConfiguration} from "@/api/application/types/node";


export class Nodes {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    list = async (
        include?: ("allocations" | "location" | "servers")[],
        page: number = 1
    ): Promise<Node[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Node, "node">>
        >("/nodes", {
            params: {include: include?.join(","), page}
        })
        return data.data.map(s => s.attributes)
    }

    listDeployable = async (
        filters: {
            disk: number,
            memory: number,
            cpu?: number,
            location_ids?: string[],
            tags?: string[]
        },
        include?: ("allocations" | "location" | "servers")[],
        page: number = 1
    ): Promise<Node[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Node, "node">>
        >("/nodes/deployable", {
            params: {
                include: include?.join(","),
                disk: filters.disk,
                memory: filters.memory,
                cpu: filters.cpu,
                location_ids: filters.location_ids,
                tags: filters.tags,
                page: page
            }
        })
        return data.data.map(s => s.attributes)
    }

    info = async (
        id: number,
        include?: ("allocations" | "location" | "servers")[],
    ): Promise<Node> => {
        z.number().positive().parse(id)
        const {data} = await this.r.get<
            GenericResponse<Node, "node">
        >(`/nodes/${id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    create = async (node: z.infer<typeof NodeCreateSchema>): Promise<Node> => {
        node = NodeCreateSchema.parse(node)
        const {data} = await this.r.post<
            GenericResponse<Node, "node">
        >("/nodes", node)
        return data.attributes
    }

    get_configuration = async (id: number): Promise<NodeConfiguration> => {
        z.number().positive().parse(id)
        const {data} = await this.r.get<NodeConfiguration>(`/nodes/${id}/configuration`)
        return data
    }

    update = async (id: number, node: z.infer<typeof NodeCreateSchema>): Promise<Node> => {
        z.number().positive().parse(id)
        node = NodeCreateSchema.parse(node)
        const {data} = await this.r.patch<
            GenericResponse<Node, "node">
        >(`/nodes/${id}`, node)
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.delete(`/nodes/${id}`)
    }

    allocations = (server_id: number): NodesAllocations => (
        new NodesAllocations(this.r, server_id)
    )
}

const NodeCreateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    public: z.boolean().optional(),
    fqdn: z.string().nonempty(),
    scheme: z.enum(["http", "https"]),
    behind_proxy: z.boolean().optional(),
    memory: z.number().min(0),
    memory_overallocate: z.number().min(-1),
    disk: z.number().min(0),
    disk_overallocate: z.number().min(-1),
    cpu: z.number().min(0),
    cpu_overallocate: z.number().min(-1),
    daemon_base: z.string().nonempty().optional(),
    daemon_sftp: z.number().min(1).max(65535),
    daemon_sftp_alias: z.string().optional(),
    daemon_listen: z.number().min(1).max(65535),
    daemon_connect: z.number().min(1).max(65535),
    maintenance_mode: z.boolean().optional(),
    upload_size: z.number().min(1).max(1024),
    tags: z.array(z.string()).optional(),
})