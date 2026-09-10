import type {Nullable} from "@/utils/types"

export type ApplicationBackup = {
    id: number
    uuid: string
    server_id: Nullable<number>
    is_global: boolean
    previous_server_uuid: Nullable<string>
    user_id: Nullable<number>
    name: string
    ignored_files: string[]
    disk: string
    checksum: Nullable<string>
    bytes: number
    is_successful: boolean
    is_locked: boolean
    status: string
    completed_at: Nullable<string>
    created_at: Nullable<string>
    updated_at: Nullable<string>
}
