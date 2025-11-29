import type {AxiosInstance} from "axios"
import type z from "zod"
import {DatabaseHosts} from "@/api/application/database_hosts"
import {Eggs} from "@/api/application/eggs"
import {Mounts} from "@/api/application/mounts"
import {Nodes} from "@/api/application/nodes"
import {Roles} from "@/api/application/roles"
import {CreateServerSchema, Servers} from "@/api/application/servers"
import type {ApplicationServer} from "@/api/application/types/server"
import {Users} from "@/api/application/users"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"

export class Client {
    private readonly r: AxiosInstance
    users: Users
    nodes: Nodes
    databaseHosts: DatabaseHosts
    roles: Roles
    eggs: Eggs
    mounts: Mounts

    constructor(requester: AxiosInstance) {
        this.r = requester

        this.users = new Users(requester)
        this.nodes = new Nodes(requester)
        this.databaseHosts = new DatabaseHosts(requester)
        this.roles = new Roles(requester)
        this.eggs = new Eggs(requester)
        this.mounts = new Mounts(requester)
    }

    get $r(): AxiosInstance {
        return this.r
    }

    listServers = async (
        search?: string,
        page: number = 1
    ): Promise<ApplicationServer[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ApplicationServer, "server">>
        >("/servers", {params: {search, page}})
        return data.data.map(s => s.attributes)
    }

    createServer = async (
        opts: z.infer<typeof CreateServerSchema>
    ): Promise<ApplicationServer> => {
        opts = CreateServerSchema.parse(opts)
        const {data} = await this.r.post<
            GenericResponse<ApplicationServer, "server">
        >("/servers", opts)
        return data.attributes
    }

    getServerByExternalId = async (
        external_id: string,
        include?: ("egg" | "subusers")[]
    ): Promise<ApplicationServer> => {
        const {data} = await this.r.get<
            GenericResponse<ApplicationServer, "server">
        >(`/servers/external/${external_id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    servers = (server_id: number) => new Servers(this.r, server_id)
}
