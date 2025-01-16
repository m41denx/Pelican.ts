import {GenericResponse} from "@/api/base/types";
import {Server} from "@/api/application/types/server";


export type Allocation = {
    id?: number,
    ip: string,
    ip_alias: string,
    port: number,
    notes: string | null,
    is_default: boolean
}

export type AllocationRel = Allocation & {
    relationships?: {
        node?: GenericResponse<Node, "node">,
        server?: GenericResponse<Server, "server">
    }
}