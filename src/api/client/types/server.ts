import { GenericListResponse, GenericResponse } from "@/api/base/types"
import { EggVariable } from "@/api/common/types/egg"
import { ServerSubuser } from "@/api/client/types/server_subuser"
import { FeatureLimits, ServerLimits } from "@/api/common/types/server_limits"
import { ServerAllocation } from "@/api/client/types/server_allocation"
import { Nullable } from "@/utils/types"

export type Server = {
    server_owner: boolean
    identifier: string
    internal_id?: number
    uuid: string
    name: string
    node: string
    is_node_under_maintenance: boolean
    sftp_details: {
        ip: string
        alias: Nullable<string>
        port: number
    }
    description: string
    limits: ServerLimits
    invocation: string
    docker_image: string
    egg_features: Nullable<string[]>
    feature_limits: FeatureLimits
    status: Nullable<unknown>
    is_suspended: boolean
    is_installing: boolean
    is_transferring: boolean
    relationships: {
        allocations: GenericListResponse<
            GenericResponse<ServerAllocation, "allocation">
        >
        variables: GenericListResponse<
            GenericResponse<EggVariable, "egg_variable">
        >
        egg?: GenericResponse<
            {
                uuid: string
                name: string
            },
            "egg"
        >
        subusers?: GenericListResponse<
            GenericResponse<ServerSubuser, "server_subuser">
        >
    }
}

export type ServerStats = {
    current_state:
        | "installing"
        | "install_failed"
        | "reinstall_failed"
        | "suspended"
        | "restoring_backup"
        | "running"
        | "stopped"
        | "offline"
    is_suspended: boolean
    resources: ServerResources
}

type ServerResources = {
    memory_bytes: number
    cpu_absolute: number
    disk_bytes: number
    network_tx_bytes: number
    network_rx_bytes: number
    uptime: number
}
export type ServerActivityLog = {
    id: string
    event: string
    is_api: boolean
    ip: string
    description: Nullable<string>
    properties: Record<string, string>
    has_additional_metadata: boolean
    timestamp: string
}
