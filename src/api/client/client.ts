import {Account} from "@/api/client/account"
import {AxiosInstance} from "axios"
import {Permission} from "@/api/client/types/user"
import {GenericListResponse, GenericResponse} from "@/api/base/types"
import {Server} from "@/api/client/types/server"
import z from "zod"
import {ServerClient} from "@/api/client/server"

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
