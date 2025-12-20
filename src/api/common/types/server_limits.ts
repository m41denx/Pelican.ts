import type {Nullable} from "@/utils/types"

/**
 * Server limits indicate how many resources can be used by the server
 */
export type ServerLimits = {
    /**
     * Memory limit in megabytes, 0 = unlimited
     * @remarks
     * This is not a pterodactyl's MiB, it's a MB (multiple of 1000).
     * That means to set 8GB RAM, you should set 8000 instead of 8192
     */
    memory: number
    /**
     * Swap limit in megabytes, 0 = disabled, -1 = unlimited
     * @see memory
     */
    swap: number
    /**
     * Disk limit in megabytes, 0 = unlimited
     * @see memory
     */
    disk: number
    /**
     * IO is an arbitrary value indicating IO importance relative to other servers
     */
    io: number
    /**
     * CPU limit in percentage, 0 = unlimited (1 core = 100%)
     */
    cpu: number
    /**
     * CPU pinning (Optional)
     * @usage
     * ```
     * 1 or 1,2,4 or 1-4
     * ```
     * @remarks
     * Can be useful to pin workloads to P-cores and avoid E-cores or HT/SMT cores
     * @see https://superuser.com/questions/122536/what-is-hyper-threading-and-how-does-it-work
     */
    threads: Nullable<number | string>
    /**
     * If OOM killer should be disabled, opposite of {@link oom_killer}
     * @deprecated use {@link oom_killer}
     */
    oom_disabled: boolean
    /**
     * If OOM killer should be enabled, opposite of {@link oom_disabled}
     */
    oom_killer: boolean
}

/**
 * Feature limits indicate how many features can user enable by themselves. It doesn't include features assigned
 * by admins
 */
export type FeatureLimits = {
    databases: number
    allocations: number
    backups: number
}
