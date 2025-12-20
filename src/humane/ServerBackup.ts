import type {ServerClient} from "@/api/client/server"
import type {ServerBackup as ServerBackupT} from "@/api/common/types/server_backup"
import type {Nullable} from "@/utils/types"

/**
 * Instance of a Humane Pelican Server Backup
 *
 * @class
 * @example
 * You can create account from a raw client
 * ```ts
 * import {PelicanAPIClient} from "@pelican.ts/sdk/api"
 * const client = new PelicanAPIClient(...)
 * const backupData = await client.account.server(...).backups.info(...)
 * const backup = new ServerBackup(client, backupData)
 * ```
 */
export class ServerBackup {
    private readonly client: ServerClient
    readonly bytes: number
    readonly checksum: Nullable<string>
    readonly completedAt: Nullable<Date>
    readonly createdAt: Date
    readonly ignoredFiles: string[]
    readonly isLocked: boolean
    readonly isSuccessful: boolean
    readonly name: string
    readonly uuid: string

    constructor(client: ServerClient, backup: ServerBackupT) {
        this.client = client
        this.bytes = backup.bytes
        this.checksum = backup.checksum
        this.completedAt = backup.completed_at
            ? new Date(backup.completed_at)
            : null
        this.createdAt = new Date(backup.created_at)
        this.ignoredFiles = backup.ignored_files
        this.isLocked = backup.is_locked
        this.isSuccessful = backup.is_successful
        this.name = backup.name
        this.uuid = backup.uuid
    }

    downloadGetUrl = async () => this.client.backups.downloadGetUrl(this.uuid)

    download = async () => this.client.backups.download(this.uuid)

    delete = async () => this.client.backups.delete(this.uuid)

    rename = async (name: string) => this.client.backups.rename(this.uuid, name)

    toggleLock = async () => this.client.backups.toggleLock(this.uuid)

    restore = async (truncate: boolean) =>
        this.client.backups.restore(this.uuid, truncate)
}
