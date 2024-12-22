import {GenericListResponse, GenericResponse} from "@/api/base/types";

export type Schedule = {
    id: number,
    name: string,
    cron: {
        day_of_week: string,
        day_of_month: string,
        hour: string,
        minute: string
    },
    is_active: boolean,
    is_processing: boolean,
    last_run_at: string | null,
    next_run_at: string,
    created_at: string,
    updated_at: string,
    relationships: {
        tasks: GenericListResponse<GenericResponse<ScheduleTask, "schedule_task">>
    }
}

export type ScheduleTask = {
    id: number,
    sequence_id: number,
    action: "command" | "power" | "backup",
    payload: string,
    time_offset: number,
    is_queued: boolean,
    created_at: string,
    updated_at: string
}