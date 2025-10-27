import {GenericResponse} from "@/api/base/types";
import {ApplicationServer} from "@/api/application/types/server";
import {Node} from "@/api/application/types/node";
import {Nullable} from "@/utils/types";


export type Allocation = {
    id: number,
    ip: string,
    alias: Nullable<string>,
    port: number,
    notes: Nullable<string>,
    assigned: boolean
}

export type AllocationRel = Allocation & {
    relationships?: {
        node?: GenericResponse<Node, "node">,
        server?: GenericResponse<ApplicationServer, "server">
    }
}