import type {AxiosInstance} from "axios"
import type z from "zod"
import {Backups} from "@/api/application/backups"
import {DatabaseHosts} from "@/api/application/database_hosts"
import {Eggs} from "@/api/application/eggs"
import {Mounts} from "@/api/application/mounts"
import {Nodes} from "@/api/application/nodes"
import {Plugins} from "@/api/application/plugins"
import {Roles} from "@/api/application/roles"
import {CreateServerSchema, Servers} from "@/api/application/servers"
import type {ApplicationServer} from "@/api/application/types/server"
import {Users} from "@/api/application/users"
import {
    type APIExtension,
    type Extended,
    mountExtension
} from "@/api/base/extend"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"

export class Client {
    private readonly r: AxiosInstance
    users: Users
    nodes: Nodes
    databaseHosts: DatabaseHosts
    roles: Roles
    eggs: Eggs
    mounts: Mounts
    plugins: Plugins
    backups: Backups

    constructor(requester: AxiosInstance) {
        this.r = requester

        this.users = new Users(requester)
        this.nodes = new Nodes(requester)
        this.databaseHosts = new DatabaseHosts(requester)
        this.roles = new Roles(requester)
        this.eggs = new Eggs(requester)
        this.mounts = new Mounts(requester)
        this.plugins = new Plugins(requester)
        this.backups = new Backups(requester)
    }

    get $r(): AxiosInstance {
        return this.r
    }

    /**
     * Mount a custom API on the client. The extension class is constructed
     * with this client's requester and exposed under `key`.
     *
     * @example
     * class GlobalBackups {
     *     constructor(private readonly r: AxiosInstance) {}
     *     list = async () => (await this.r.get("/backups")).data
     * }
     *
     * const app = new PelicanAPIApplication(url, token)
     *     .$extend("globalBackups", GlobalBackups)
     * await app.globalBackups.list()
     */
    $extend<K extends string, T extends APIExtension>(
        key: K extends keyof this ? never : K,
        extension: T
    ): Extended<this, K, T> {
        mountExtension(this, this.r, key, extension)
        return this as Extended<this, K, T>
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
