import {Nullable} from "@/utils/types"

export type DatabaseHost = {
    id: number
    name: string
    host: string
    port: number
    username: string
    created_at: string
    updated_at: Nullable<string>
}
