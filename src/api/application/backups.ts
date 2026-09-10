import type {AxiosInstance} from "axios"
import type {ApplicationBackup} from "@/api/application/types/backup"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"

export type ListBackupsFilters = {
    name?: string
    uuid?: string
    server_id?: number
    is_global?: boolean
    previous_server_uuid?: string
}

export type ListBackupsOptions = {
    filters?: ListBackupsFilters
    include?: ("server" | "user")[]
}

export class Backups {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    /**
     * List all backups on the panel. Pass `filters.is_global` to view only
     * global (detached) backups, or `filters.server_id` for a single server's
     * backups.
     */
    list = async (
        opts: ListBackupsOptions = {},
        page: number = 1
    ): Promise<ApplicationBackup[]> => {
        const params: Record<string, unknown> = {
            page,
            include: opts.include?.join(",")
        }

        for (const [key, value] of Object.entries(opts.filters ?? {})) {
            if (value !== undefined) {
                params[`filter[${key}]`] =
                    typeof value === "boolean" ? (value ? 1 : 0) : value
            }
        }

        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ApplicationBackup, "backup">>
        >("/backups", {params})
        return data.data.map(d => d.attributes)
    }

    info = async (
        id: number,
        include?: ("server" | "user")[]
    ): Promise<ApplicationBackup> => {
        const {data} = await this.r.get<
            GenericResponse<ApplicationBackup, "backup">
        >(`/backups/${id}`, {params: {include: include?.join(",")}})
        return data.attributes
    }

    /**
     * Decouple a backup from its server, turning it into a global backup that
     * survives the deletion of its server. S3 backups only.
     */
    detach = async (id: number): Promise<ApplicationBackup> => {
        const {data} = await this.r.post<
            GenericResponse<ApplicationBackup, "backup">
        >(`/backups/${id}/detach`)
        return data.attributes
    }

    /**
     * Re-attach a global backup to a server.
     */
    attach = async (
        id: number,
        server_id: number
    ): Promise<ApplicationBackup> => {
        const {data} = await this.r.post<
            GenericResponse<ApplicationBackup, "backup">
        >(`/backups/${id}/attach`, {server_id})
        return data.attributes
    }

    /**
     * Change the owner of a global backup.
     */
    changeOwner = async (
        id: number,
        user_id: number
    ): Promise<ApplicationBackup> => {
        const {data} = await this.r.patch<
            GenericResponse<ApplicationBackup, "backup">
        >(`/backups/${id}/owner`, {user_id})
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        await this.r.delete(`/backups/${id}`)
    }
}
