import {AxiosInstance} from "axios"
import {GenericListResponse, GenericResponse} from "@/api/base/types"
import {Egg, ExportedEgg} from "@/api/application/types/egg"

// TODO: API is incomplete

export class Eggs {
    private readonly r: AxiosInstance

    constructor(r: AxiosInstance) {
        this.r = r
    }

    list = async (): Promise<Egg[]> => {
        const {data} =
            await this.r.get<GenericListResponse<GenericResponse<Egg, "egg">>>(
                "/eggs"
            )
        return data.data.map(d => d.attributes)
    }

    info = async (id: number): Promise<Egg> => {
        const {data} = await this.r.get<GenericResponse<Egg, "egg">>(
            `/eggs/${id}`
        )
        return data.attributes
    }

    export = async (id: number, format: "json" | "yaml"): Promise<string> => {
        const {data} = await this.r.get<string>(`/eggs/${id}/export`, {
            params: {format},
            transformResponse: r => r
        })
        return data
    }

    infoExportable = async (id: number): Promise<ExportedEgg> => {
        const {data} = await this.r.get<ExportedEgg>(`/eggs/${id}/export`, {
            params: {format: "json"}
        })
        return data
    }
}
