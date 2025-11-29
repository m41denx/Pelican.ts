import type {Container} from "@/api/application/types/container"
import type {
    FeatureLimits,
    ServerLimits
} from "@/api/common/types/server_limits"
import type {Nullable} from "@/utils/types"

export type ApplicationServer = {
    id: number
    external_id: Nullable<string>
    uuid: string
    identifier: string
    name: string
    description: string
    status: Nullable<unknown>
    suspended: boolean
    limits: ServerLimits
    feature_limits: FeatureLimits
    user: number
    node: number
    allocation: number
    egg: number
    container: Container
    created_at: string
    updated_at: Nullable<string>
}
