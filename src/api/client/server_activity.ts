import type {AxiosInstance} from "axios"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {ServerActivityLog} from "@/api/client/types/server"

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
        opts?: {
            sortByTimestamp?: "asc" | "desc",
            includeActor?: boolean
        }
    ): Promise<ServerActivityLog[]> => {
        const {data} = await this.r.get<
            GenericListResponse<
                GenericResponse<ServerActivityLog, "activity_log">
            >
        >(`/servers/${this.id}/activity`, {
            params: {
                page, per_page,
                ...(
                    opts?.sortByTimestamp
                        ? {sort: `${opts.sortByTimestamp === "desc" ? "-" : ""}timestamp`}
                        : {}
                ),
                ...(
                    opts?.includeActor
                        ? {include: "actor"}
                        : {}
                )
            }
        })
        return data.data.map(log => log.attributes)
    }
}
