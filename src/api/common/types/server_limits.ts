


export type ServerLimits = {
    memory: number,
    swap: number,
    disk: number,
    io: number,
    cpu: number,
    threads: number | null,
    oom_disabled: boolean
}

export type FeatureLimits = {
    databases: number,
    allocations: number,
    backups: number
}