import {Nullable} from "@/utils/types";


export type ServerBackup = {
    uuid: string
    is_successful: boolean,
    is_locked: boolean,
    name: string
    ignored_files: string[]
    checksum: Nullable<string>
    bytes: number
    created_at: string
    completed_at: Nullable<string>
}