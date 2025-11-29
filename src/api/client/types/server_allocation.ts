import type {Nullable} from "@/utils/types"

export type ServerAllocation = {
    id: number
    ip: string
    ip_alias: Nullable<string>
    port: number
    notes: Nullable<string>
    is_default: boolean
}
