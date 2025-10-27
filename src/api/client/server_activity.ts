import {AxiosInstance} from "axios";
import {ServerActivityLog} from "@/api/client/types/server";
import {GenericListResponse, GenericResponse} from "@/api/base/types";

export class ServerActivity {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(r: AxiosInstance, id: string) {
        this.r = r
        this.id = id
    }

    list = async (
        page: number = 1,
        per_page: number = 25,
    ): Promise<ServerActivityLog[]> => {
        const {data} = await this.r.get<GenericListResponse<GenericResponse<ServerActivityLog, "activity_log">>>(`/server/${this.id}/activity`, {
            params: {
                page,
                per_page,
            },
        })
        return data.data.map(log => log.attributes)
    }
}