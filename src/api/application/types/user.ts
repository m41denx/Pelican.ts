import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Server} from "@/api/application/types/server";

export type User = {
    id: number,
    external_id: string | null,
    uuid: string,
    username: string,
    email: string,
    first_name: string,
    last_name: string,
    language: string,
    root_admin: string,
    "2fa": boolean,
    created_at: string,
    updated_at: string,
    relationships?: {
        servers: GenericListResponse<GenericResponse<Server>>
    }
}