import type {AxiosInstance} from "axios"
import z from "zod"
import {
    type APIExtension,
    type Extended,
    mountExtension
} from "@/api/base/extend"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import {Account} from "@/api/client/account"
import {ServerClient} from "@/api/client/server"
import type {Server} from "@/api/client/types/server"
import type {Permission} from "@/api/client/types/user"

export class Client {
    account: Account

    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
        this.account = new Account(requester)
    }

    get $r(): AxiosInstance {
        return this.r
    }

    /**
     * Mount a custom API on the client. The extension class is constructed
     * with this client's requester and exposed under `key`.
     *
     * @example
     * class Notes {
     *     constructor(private readonly r: AxiosInstance) {}
     *     list = async () => (await this.r.get("/notes")).data
     * }
     *
     * const client = new PelicanAPIClient(url, token).$extend("notes", Notes)
     * await client.notes.list()
     */
    $extend<K extends string, T extends APIExtension>(
        key: K extends keyof this ? never : K,
        extension: T
    ): Extended<this, K, T> {
        mountExtension(this, this.r, key, extension)
        return this as Extended<this, K, T>
    }

    listPermissions = async (): Promise<Record<string, Permission>> => {
        const {data} =
            await this.r.get<
                GenericResponse<
                    {permissions: Record<string, Permission>},
                    "system_permissions"
                >
            >("/permissions")

        return data.attributes.permissions
    }

    listServers = async (
        type: "accessible" | "mine" | "admin" | "admin-all" = "accessible",
        page: number = 1,
        per_page: number = 50,
        include?: ("egg" | "subusers")[]
    ): Promise<Server[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Server, "server">>
        >("/", {params: {type, page, include: include?.join(",")}})
        return data.data.map(s => s.attributes)
    }

    server = (uuid: string): ServerClient => new ServerClient(this.r, uuid)
}

/*
Include:    ?include=param1,param2
Avail:      ?param1=val1&param2=val2
Filters:    ?filter[param1]=val1&filter[param2]=val2
Sort:       ?sort=-param, param=asc, -param=desc
*/
