import {AxiosInstance} from "axios";
import z from "zod";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Database} from "@/api/common/types/server_database";


export class ServerDatabases {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (
        include?: ("password")[], page: number = 1
    ): Promise<Database[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Database, "server_database">>
        >(`/servers/${this.id}/databases`, {
            params: {include: include?.join(","), page}
        })
        return data.data.map(d => d.attributes)
    }

    create = async (database: string, remote: string): Promise<Database> => {
        const {data} = await this.r.post<
            GenericResponse<Database, "server_database">
        >(`/servers/${this.id}/databases`, {database, remote})
        return data.attributes
    }

    rotatePassword = async (database_id: string): Promise<Database> => {
        const {data} = await this.r.post<
            GenericResponse<Database, "server_database">
        >(`/servers/${this.id}/databases/${database_id}/rotate-password`)
        return data.attributes
    }

    delete = async (database_id: string): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/databases/${database_id}`)
    }
}