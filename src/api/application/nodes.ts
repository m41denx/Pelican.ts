import {AxiosInstance} from "axios";
import {NodesAllocations} from "@/api/application/nodes_allocations";
import {Server} from "@/api/application/types/server";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import z from "zod";
import {Node} from "@/api/application/types/node";


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
        >("/application/nodes", {
            params: {include: include?.join(","), page}
        })
        return data.data.map(s => s.attributes)
    }

    info = async (
        id: number,
        include?: ("allocations" | "location" | "servers")[],
        ): Promise<Node> => {
        z.number().positive().parse(id)
        const {data} = await this.r.get<GenericResponse<Node, "node">>(
            `/application/nodes/${id}`,
            {params: {include: include?.join(",")}}
        )
        return data.attributes
    }

    show_configuration = async (id: number): Promise<any> => {
        z.number().positive().parse(id)
        const {data} = await this.r.get(`/application/nodes/${id}/configuration`)
        return data
    }

    create = async (node: NodeCreate): Promise<NodeUpdated> => {
        const {data} = await this.r.post<
            GenericResponse<NodeUpdated, "node">
        >(
            "/application/nodes",
            node
        )
        return data.attributes
    }

    update = async (id: number, node: Node): Promise<NodeUpdated> => {
        z.number().positive().parse(id)
        const {data} = await this.r.put<
            GenericResponse<NodeUpdated, "node">
        >(
            `/application/nodes/${id}`,
            node
        )
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.delete(`/application/nodes/${id}`)
    }

    allocations = (server_id: number): NodesAllocations => (
        new NodesAllocations(this.r, server_id)
    )
}

type NodeCreate = {
    name: string,
    location_id: number,
    fqdn: string,
    scheme: "https" | "http",
    memory: number,
    memory_overallocate: number,
    disk: number,
    disk_overallocate: number,
    upload_size: number,
    daemon_listen: number,
    daemon_sftp: number
}

type NodeAllocatedResources = {
    memory: number,
    disk: number
}

type NodeUpdated = Node & {allocated_resources: NodeAllocatedResources}