import {AxiosInstance} from "axios";
import {Schedule, ScheduleTask} from "@/api/common/types/server_schedule";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {PartialBy} from "@/utils/types";

export class ServerSchedules {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (): Promise<Schedule[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Schedule, "server_schedule">>
        >(`/servers/${this.id}/schedules`)
        return data.data.map(d => d.attributes)
    }

    create = async (params: ScheduleCreateParams): Promise<Schedule> => {
        const {data} = await this.r.post<
            GenericResponse<Schedule, "server_schedule">
        >(`/servers/${this.id}/schedules`, params)
        return data.attributes
    }

    control = (sched_id: number) => new ScheduleControl(this.r, this.id, sched_id)
}

type ScheduleCreateParams = {
    name: string,
    is_active?: boolean,
    only_when_online?: boolean,
    minute: string,
    hour: string,
    day_of_week: string,
    month: string,
    day_of_month: string
}

class ScheduleControl {
    private r: AxiosInstance
    private readonly id: string
    private readonly sched_id: number

    constructor(requester: AxiosInstance, id: string, sched_id: number) {
        this.r = requester
        this.id = id
        this.sched_id = sched_id
    }

    info = async (): Promise<Schedule> => {
        const {data} = await this.r.get<
            GenericResponse<Schedule, "server_schedule">
        >(`/servers/${this.id}/schedules/${this.sched_id}`)
        return data.attributes
    }

    update = async (params: ScheduleCreateParams): Promise<Schedule> => {
        const {data} = await this.r.post<
            GenericResponse<Schedule, "server_schedule">
        >(`/servers/${this.id}/schedules/${this.sched_id}`, params)
        return data.attributes
    }

    delete = async (): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/schedules/${this.sched_id}`)
    }

    execute = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/schedules/${this.sched_id}/execute`)
    }

    tasks = {
        create: async (
            opts: PartialBy<
                Pick<ScheduleTask, "action" | "payload" | "time_offset" | "sequence_id" | "continue_on_failure">,
                "payload" | "sequence_id" | "continue_on_failure"
            >
        ): Promise<ScheduleTask> => {
            const {data} = await this.r.post<
                GenericResponse<ScheduleTask, "server_schedule_task">
            >(`/servers/${this.id}/schedules/${this.sched_id}/tasks`, opts)
            return data.attributes
        },

        update: async <T extends "command" | "power" | "backup" | "delete_files">(
            task_id: number,
            opts: PartialBy<
                Pick<ScheduleTask, "action" | "payload" | "time_offset" | "sequence_id" | "continue_on_failure">,
                "payload" | "sequence_id" | "continue_on_failure"
            >
        ): Promise<ScheduleTask> => {
            const {data} = await this.r.post<
                GenericResponse<ScheduleTask, "server_schedule_task">
            >(`/servers/${this.id}/schedules/${this.sched_id}/tasks/${task_id}`, opts)
            return data.attributes
        },

        delete: async (task_id: number): Promise<void> => {
            await this.r.delete(`/servers/${this.id}/schedules/${this.sched_id}/tasks/${task_id}`)
        }
    }
}