import {AxiosInstance} from "axios";
import {Schedule, ScheduleTask} from "@/api/common/types/server_schedule";
import {GenericListResponse, GenericResponse} from "@/api/base/types";

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
        >(`/client/servers/${this.id}/schedules`)
        return data.data.map(d => d.attributes)
    }

    create = async (params: ScheduleCreateParams): Promise<Schedule> => {
        const {data} = await this.r.post<
            GenericResponse<Schedule, "server_schedule">
        >(`/client/servers/${this.id}/schedules`, params)
        return data.attributes
    }

    control = (sched_id: number) => new ScheduleControl(this.r, this.id, sched_id)
}

type ScheduleCreateParams = {
    name: string,
    is_active: boolean,
    minute: string,
    hour: string,
    day_of_week: string,
    day_of_month: string
}

class ScheduleControl {
    private r: AxiosInstance
    private id: string
    private sched_id: number

    constructor(requester: AxiosInstance, id: string, sched_id: number) {
        this.r = requester
        this.id = id
        this.sched_id = sched_id
    }

    info = async (): Promise<Schedule> => {
        const {data} = await this.r.get<
            GenericResponse<Schedule, "server_schedule">
        >(`/client/servers/${this.id}/schedules/${this.sched_id}`)
        return data.attributes
    }

    update = async (params: ScheduleCreateParams): Promise<Schedule> => {
        const {data} = await this.r.post<
            GenericResponse<Schedule, "server_schedule">
        >(`/client/servers/${this.id}/schedules/${this.sched_id}`, params)
        return data.attributes
    }

    delete = async (): Promise<void> => {
        await this.r.delete(`/client/servers/${this.id}/schedules/${this.sched_id}`)
    }

    tasks = {
        create: async (
            action: ScheduleTask['action'], payload: string, time_offset: number
        ): Promise<ScheduleTask> => {
            const {data} = await this.r.post<
                GenericResponse<ScheduleTask, "server_schedule_task">
            >(`/client/servers/${this.id}/schedules/${this.sched_id}/tasks`, {
                action,
                payload,
                time_offset
            })
            return data.attributes
        },

        update: async (
            task_id: number, action: ScheduleTask['action'], payload: string, time_offset: number
        ): Promise<ScheduleTask> => {
            const {data} = await this.r.post<
                GenericResponse<ScheduleTask, "server_schedule_task">
            >(`/client/servers/${this.id}/schedules/${this.sched_id}/tasks/${task_id}`, {
                action,
                payload,
                time_offset
            })
            return data.attributes
        },

        delete: async (task_id: number): Promise<void> => {
            await this.r.delete(`/client/servers/${this.id}/schedules/${this.sched_id}/tasks/${task_id}`)
        }
    }
}