import {GenericResponse} from "@/api/base/types";
import {Server} from "@/api/application/types/server";
import {Nullable} from "@/utils/types";


export type Allocation = {
    id?: number,
    ip: string,
    ip_alias: Nullable<string>,
    port: number,
    notes: Nullable<string>,
    is_default: boolean
}

export type AllocationRel = Allocation & {
    relationships?: {
        node?: GenericResponse<Node, "node">,
        server?: GenericResponse<Server, "server">
    }
}