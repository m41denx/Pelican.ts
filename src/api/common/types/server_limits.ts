import {Nullable} from "@/utils/types"

export type ServerLimits = {
    memory: number
    swap: number
    disk: number
    io: number
    cpu: number
    threads: Nullable<number | string>
    oom_disabled: boolean
    oom_killer: boolean
}

export type FeatureLimits = {
    databases: number
    allocations: number
    backups: number
}
