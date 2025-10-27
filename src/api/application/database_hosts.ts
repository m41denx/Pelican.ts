import {AxiosInstance} from "axios";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {DatabaseHost} from "@/api/application/types/database_host";
import z from "zod";

export class DatabaseHosts {
    private readonly r: AxiosInstance

    constructor(r: AxiosInstance) {
        this.r = r
    }

    list = async (
        page: number = 1
    ): Promise<DatabaseHost[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<DatabaseHost, "database_host">>
        >("/database-hosts", {
            params: {page}
        })
        return data.data.map(d => d.attributes)
    }

    info = async (
        id: string
    ): Promise<DatabaseHost> => {
        const {data} = await this.r.get<
            GenericResponse<DatabaseHost, "database_host">
        >(`/database-hosts/${id}`)
        return data.attributes
    }

    // TODO: find out why API returns 500
    create = async (
        opts: z.infer<typeof CreateDBHostSchema>
    ): Promise<void> => {
        opts = CreateDBHostSchema.parse(opts)
        await this.r.post<
            GenericResponse<DatabaseHost, "database_host">
        >("/database-hosts", opts).catch(e=>{})
    }

    update = async (
        id: string,
        opts: z.infer<typeof CreateDBHostSchema>
    ): Promise<DatabaseHost> => {
        opts = CreateDBHostSchema.parse(opts)
        const {data} = await this.r.patch<
            GenericResponse<DatabaseHost, "database_host">
        >(`/database-hosts/${id}`, opts)

        return data.attributes
    }

    delete = async (
        id: string
    ): Promise<void> => {
        await this.r.delete(`/database-hosts/${id}`)
    }
}

const CreateDBHostSchema = z.object({
    name: z.string().min(1).max(255),
    host: z.string(),
    port: z.number().min(1).max(65535),
    username: z.string().min(1).max(255),
    password: z.string().optional(),
    node_ids: z.array(z.string()).optional(),
    max_databases: z.number().optional()
})