import {Account} from "@/api/client/account";
import {AxiosInstance} from "axios";
import {Permission} from "@/api/client/types/user";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Server} from "@/api/client/types/server";
import z from "zod";
import {ServerClient} from "@/api/client/server";


export class Client {
    account: Account

    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
        this.account = new Account(requester)
    }

    listPermissions = async (): Promise<Permission[]> => {
        const {data} = await this.r.get<
            GenericResponse<{ permissions: Permission[] }, "system_permissions">
        >("/client/permissions")

        return data.attributes.permissions
    }

    listServers = async (
        include?: ("egg" | "subusers")[],
        page: number = 1
    ): Promise<Server[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Server, "server">>
        >("/client/servers", {
            params: {include: include?.join(","), page}
        })
        return data.data.map(s => s.attributes)
    }

    server = (id: string): ServerClient => new ServerClient(this.r, id)

}


/*
Include:    ?include=param1,param2
Avail:      ?param1=val1&param2=val2
Filters:    ?filter[param1]=val1&filter[param2]=val2
Sort:       ?sort=-param, param=asc, -param=desc
*/