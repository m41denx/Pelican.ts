import axios, {AxiosInstance} from "axios";
import {Backup} from "@/api/common/types/server_backup";
import z, {string} from "zod";
import {GenericListResponse, GenericResponse} from "@/api/base/types";


export class ServerBackups {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (page: number = 1): Promise<Backup[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Backup, "backup">>
        >(`/servers/${this.id}/backups`, {
            params: {page}
        })

        return data.data.map(d=>d.attributes)
    }

    create = async (): Promise<Backup> => {
        const {data} = await this.r.post<
            GenericResponse<Backup, "backup">
        >(`/servers/${this.id}/backups`)
        return data.attributes
    }

    info = async (backup_uuid: string): Promise<Backup> => {
        const {data} = await this.r.get<
            GenericResponse<Backup, "backup">
        >(`/servers/${this.id}/backups/${backup_uuid}`)
        return data.attributes
    }

    downloadGetUrl = async (backup_uuid: string): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{ url: string }, "signed_url">
        >(`/servers/${this.id}/backups/${backup_uuid}/download`)
        return data.attributes.url
    }

    download = async (backup_uuid: string): Promise<ArrayBuffer> => {
        const url = await this.downloadGetUrl(backup_uuid)
        const {data} = await axios.get<ArrayBuffer>(url, {responseType: "arraybuffer"})
        return data
    }

    delete = async (backup_uuid: string): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/backups/${backup_uuid}`)
    }

}