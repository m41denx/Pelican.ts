

export type Backup = {
    uuid: string
    name: string
    ignored_files: string[]
    sha256_hash: string | null
    bytes: number
    created_at: string
    completed_at: string | null
}