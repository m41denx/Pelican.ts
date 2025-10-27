import {AxiosInstance} from "axios";
import {CustomListResponse, GenericListResponse, GenericResponse} from "@/api/base/types";
import {StartupMeta, StartupParams} from "@/api/common/types/server_startup";


export class ServerStartup {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (): Promise<CustomListResponse<StartupParams, StartupMeta>> => {
        const {data} = await this.r.get<
            CustomListResponse<GenericResponse<StartupParams, "egg_variable">, StartupMeta>
        >(`/servers/${this.id}/startup`)

        return {
            object: "list",
            meta: data.meta,
            data: data.data.map(d=>d.attributes)
        }
    }

    set = async (key: string, value: string): Promise<StartupParams> => {
        const {data} = await this.r.put<
            GenericResponse<StartupParams, "egg_variable">
        >(`/servers/${this.id}/startup/variable`, {key, value})
        return data.attributes
    }
}