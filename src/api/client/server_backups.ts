import axios, {type AxiosInstance} from "axios"
import z from "zod"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {ServerBackup} from "@/api/common/types/server_backup"

export class ServerBackups {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (page: number = 1): Promise<ServerBackup[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ServerBackup, "backup">>
        >(`/servers/${this.id}/backups`, {params: {page}})

        return data.data.map(d => d.attributes)
    }

    create = async (args: {
        name?: string
        is_locked: boolean
        ignored_files: string[]
    }): Promise<ServerBackup> => {
        args.name = z.string().max(255).optional().parse(args.name)
        const {data} = await this.r.post<
            GenericResponse<ServerBackup, "backup">
        >(`/servers/${this.id}/backups`, {
            name: args.name,
            is_locked: args.is_locked,
            ignored_files: args.ignored_files.join("\n")
        })
        return data.attributes
    }

    info = async (backup_uuid: string): Promise<ServerBackup> => {
        const {data} = await this.r.get<
            GenericResponse<ServerBackup, "backup">
        >(`/servers/${this.id}/backups/${backup_uuid}`)
        return data.attributes
    }

    downloadGetUrl = async (backup_uuid: string): Promise<string> => {
        const {data} = await this.r.get<
            GenericResponse<{url: string}, "signed_url">
        >(`/servers/${this.id}/backups/${backup_uuid}/download`)
        return data.attributes.url
    }

    download = async (backup_uuid: string): Promise<ArrayBuffer> => {
        const url = await this.downloadGetUrl(backup_uuid)
        const {data} = await axios.get<ArrayBuffer>(url, {
            responseType: "arraybuffer"
        })
        return data
    }

    delete = async (backup_uuid: string): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/backups/${backup_uuid}`)
    }

    rename = async (backup_uuid: string, name: string): Promise<void> => {
        await this.r.put(`/servers/${this.id}/backups/${backup_uuid}/rename`, {
            name
        })
    }

    toggleLock = async (backup_uuid: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/backups/${backup_uuid}/lock`)
    }

    restore = async (backup_uuid: string, truncate: boolean): Promise<void> => {
        await this.r.post(
            `/servers/${this.id}/backups/${backup_uuid}/restore`,
            {truncate}
        )
    }
}
