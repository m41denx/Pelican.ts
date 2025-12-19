import type {AxiosInstance} from "axios"
import type {Egg, ExportedEgg} from "@/api/application/types/egg"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"

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

    import = async (
        egg: ExportedEgg | string,
        format: "json" | "yaml" = "json"
    ): Promise<ExportedEgg> => {
        let body!: ExportedEgg | FormData
        if (format === "yaml" && typeof egg === "string") {
            throw new Error("YAML import is not supported yet")
        } else if (format === "json" && typeof egg === "object")
            body = egg
        else
            throw new Error("Invalid format or egg type")

        const {data} = await this.r.post<ExportedEgg>(`/eggs/import`, body, {
            params: {format}
        })
        return data
    }

    delete = async (id: number): Promise<void> => {
        await this.r.delete(`/eggs/${id}`)
    }

    deleteByUUID = async (uuid: string): Promise<void> => {
        await this.r.delete(`/eggs/uuid/${uuid}`)
    }
}
