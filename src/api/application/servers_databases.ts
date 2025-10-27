import {AxiosInstance} from "axios";
import {ServerDatabase} from "@/api/common/types/server_database";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import z from "zod";

// TODO: Check if database type is valid
export class ServersDatabases {
    private readonly r: AxiosInstance
    private readonly id: number

    constructor(r: AxiosInstance, server_id: number) {
        this.r = r
        this.id = server_id
    }

    list = async (): Promise<ServerDatabase[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ServerDatabase, "server_database">>
        >(`/servers/${this.id}/databases`)
        return data.data.map(d => d.attributes)
    }

    create = async (
        database: string,
        remote: string,
        host: string
    ): Promise<ServerDatabase> => {
        database = z.string().min(1).max(48).parse(database)
        const {data} = await this.r.post<
            GenericResponse<ServerDatabase, "server_database">
        >(`/servers/${this.id}/databases`, {database, remote, host})
        return data.attributes
    }

    info = async (database_id: number): Promise<ServerDatabase> => {
        const {data} = await this.r.get<
            GenericResponse<ServerDatabase, "server_database">
        >(`/servers/${this.id}/databases/${database_id}`)
        return data.attributes
    }

    delete = async (database_id: number): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/databases/${database_id}`)
    }

    resetPassword = async (database_id: number): Promise<void> => {
        await this.r.post(`/servers/${this.id}/databases/${database_id}/reset-password`)
    }
}