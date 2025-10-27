import {AxiosInstance} from "axios";
import {Users} from "@/api/application/users";
import {Nodes} from "@/api/application/nodes";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Server} from "@/api/application/types/server";
import {CreateServerShema, Servers} from "@/api/application/servers";
import z from "zod";

export class Client {
    private readonly r: AxiosInstance
    users: Users
    nodes: Nodes

    constructor(requester: AxiosInstance) {
        this.r = requester

        this.users = new Users(requester)
        this.nodes = new Nodes(requester)
    }

    listServers = async (
        search?: string,
        page: number = 1
    ): Promise<Server[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Server, "server">>
        >("/servers", {
            params: {search, page}
        })
        return data.data.map(s => s.attributes)
    }

    createServer = async (opts: z.infer<typeof CreateServerShema>): Promise<Server> => {
        opts = CreateServerShema.parse(opts)
        const {data} = await this.r.post<GenericResponse<Server, "server">>("/servers", opts)
        return data.attributes
    }

    getServerByExternalId = async (external_id: string, include?: ("egg" | "subusers")[]): Promise<Server> => {
        const {data} = await this.r.get<GenericResponse<Server, "server">>(`/servers/external/${external_id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    servers = (server_id: number) => new Servers(this.r, server_id)
}