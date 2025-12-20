import type {ApplicationServer} from "@/api/application/types/server"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {Nullable} from "@/utils/types"

export type ApplicationUser = {
    id: number
    external_id: Nullable<string>
    is_managed_externally: boolean,
    uuid: string
    username: string
    email: string
    language: string
    root_admin: string
    "2fa_enabled": boolean
    "2fa": boolean
    created_at: string
    updated_at: Nullable<string>
    relationships?: {
        servers: GenericListResponse<GenericResponse<ApplicationServer>>
    }
}

export type ApplicationUserApiKey = {
    id: number
    user_id: number
    key_type: 1
    identifier: string
    memo: string
    allowed_ips: Array<string>
    permissions: []
    last_used_at: Nullable<string>
    expires_at: Nullable<string>
    created_at: string
    updated_at: string
}
