import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Server} from "@/api/application/types/server";
import {Nullable} from "@/utils/types";

export type User = {
    id: number,
    external_id: Nullable<string>,
    uuid: string,
    username: string,
    email: string,
    language: string,
    root_admin: string,
    "2fa_enabled": boolean,
    "2fa": boolean,
    created_at: string,
    updated_at: Nullable<string>,
    relationships?: {
        servers: GenericListResponse<GenericResponse<Server>>
    }
}