import {Nullable} from "@/utils/types"

export type User = {
    uuid: string
    username: string
    email: string
    language: string
    image: string
    admin: boolean
    root_admin: boolean
    "2fa_enabled": boolean
    created_at: string
    updated_at: string
}

export type APIKey = {
    identifier: string
    description: string
    allowed_ips: string[]
    last_used_at: Nullable<string>
    created_at: string
}

export type SSHKey = {
    name: string
    fingerprint: string
    pubic_key: string
    created_at: string
}

export type Permission = {description: string; keys: Record<string, string>}
