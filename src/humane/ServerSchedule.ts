import type {ServerClient} from "@/api/client/server"
import type {Schedule, ScheduleTask} from "@/api/common/types/server_schedule"
import type {Nullable, PartialBy} from "@/utils/types"

/**
 * Instance of a Humane Pelican Server Schedule
 *
 * @class
 * @example
 * You can create account from a raw client
 * ```ts
 * import {PelicanAPIClient} from "@pelican.ts/sdk/api"
 * const client = new PelicanAPIClient(...)
 * const schedData = await client.account.server(...).schedules.list()
 * const server = new ServerSchedule(client, schedData[0])
 * ```
 */
export class ServerSchedule {
    private readonly client: ServerClient
    readonly createdAt: Date
    private $cron: {
        day_of_week: string
        day_of_month: string
        hour: string
        minute: string
    }

    /**
     * CRON representation of schedule
     */
    get cron() {
        return {...this.$cron}
    }
    readonly id: number
    private $isActive: boolean

    /**
     * Is this schedule enabled
     */
    get isActive() {
        return this.$isActive
    }
    private $isProcessing: boolean

    /**
     * Is this schedule currently running
     */
    get isProcessing() {
        return this.$isProcessing
    }
    readonly lastRunAt: Nullable<Date>
    private $name: string
    get name() {
        return this.$name
    }
    readonly nextRunAt: Date
    private $onlyWhenOnline: boolean

    /**
     * Should schedule run only if server is online
     */
    get onlyWhenOnline() {
        return this.$onlyWhenOnline
    }
    readonly tasks: ServerScheduleTask[]
    private $updatedAt: Date
    get updatedAt() {
        return this.$updatedAt
    }

    constructor(client: ServerClient, schedule: Schedule) {
        this.client = client
        this.createdAt = new Date(schedule.created_at)
        this.$cron = schedule.cron
        this.id = schedule.id
        this.$isActive = schedule.is_active
        this.$isProcessing = schedule.is_processing
        this.lastRunAt = schedule.last_run_at
            ? new Date(schedule.last_run_at)
            : null
        this.$name = schedule.name
        this.nextRunAt = new Date(schedule.next_run_at)
        this.$onlyWhenOnline = schedule.only_when_online
        this.tasks = schedule.relationships.tasks.data.map(
            d => new ServerScheduleTask(this.client, this.id, d.attributes)
        )
        this.$updatedAt = new Date(schedule.updated_at)
    }

    update = async (opts: {
        name: string
        is_active?: boolean
        only_when_online?: boolean
        minute: string
        hour: string
        day_of_week: string
        month: string
        day_of_month: string
    }) => {
        const data = await this.client.schedules.control(this.id).update(opts)
        this.$name = data.name
        this.$isActive = data.is_active
        this.$isProcessing = data.is_processing
        this.$onlyWhenOnline = data.only_when_online
        this.$cron = data.cron
        this.$updatedAt = new Date(data.updated_at)
    }

    delete = async () => this.client.schedules.control(this.id).delete()

    execute = async () => this.client.schedules.control(this.id).execute()
}

export class ServerScheduleTask {
    private readonly client: ServerClient
    private readonly scheduleId: number
    private $action: "command" | "power" | "backup" | "delete_files"

    /**
     * Task action (command would likely need server to be online)
     */
    get action() {
        return this.$action
    }
    private $continueOnFailure: boolean

    /**
     * Should we fail on error or continue with other tasks?
     */
    get continueOnFailure() {
        return this.$continueOnFailure
    }
    readonly createdAt: Date
    readonly id: number
    private $isQueued: boolean

    /**
     * Is this task queued right now?
     */
    get isQueued() {
        return this.$isQueued
    }
    private $payload: string

    /**
     * Whatever task should do: command to execute, power action or list of files to backup
     */
    get payload() {
        return this.$payload
    }
    private $sequenceId: number

    /**
     * Order of this task in defined schedule
     */
    get sequenceId() {
        return this.$sequenceId
    }
    private $timeOffset: number

    /**
     * Time offset in seconds relative to schedule start time
     */
    get timeOffset() {
        return this.$timeOffset
    }
    private $updatedAt: Nullable<Date>
    get updatedAt() {
        return this.$updatedAt
    }

    constructor(client: ServerClient, scheduleId: number, task: ScheduleTask) {
        this.client = client
        this.scheduleId = scheduleId
        this.$action = task.action
        this.$continueOnFailure = task.continue_on_failure
        this.createdAt = new Date(task.created_at)
        this.id = task.id
        this.$isQueued = task.is_queued
        this.$payload = task.payload
        this.$sequenceId = task.sequence_id
        this.$timeOffset = task.time_offset
        this.$updatedAt = task.updated_at ? new Date(task.updated_at) : null
    }

    delete = async () =>
        this.client.schedules.control(this.scheduleId).tasks.delete(this.id)

    update = async (
        opts: PartialBy<
            Pick<
                ScheduleTask,
                | "action"
                | "payload"
                | "time_offset"
                | "sequence_id"
                | "continue_on_failure"
            >,
            "payload" | "sequence_id" | "continue_on_failure"
        >
    ) => {
        const data = await this.client.schedules
            .control(this.scheduleId)
            .tasks.update(this.id, opts)
        this.$action = data.action
        this.$continueOnFailure = data.continue_on_failure
        this.$isQueued = data.is_queued
        this.$payload = data.payload
        this.$sequenceId = data.sequence_id
        this.$timeOffset = data.time_offset
        this.$updatedAt = data.updated_at ? new Date(data.updated_at) : null
    }
}
