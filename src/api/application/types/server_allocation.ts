import type {Node} from "@/api/application/types/node"
import type {ApplicationServer} from "@/api/application/types/server"
import type {GenericResponse} from "@/api/base/types"
import type {Nullable} from "@/utils/types"

export type Allocation = {
    id: number
    ip: string
    alias: Nullable<string>
    port: number
    notes: Nullable<string>
    assigned: boolean
}

export type AllocationRel = Allocation & {
    relationships?: {
        node?: GenericResponse<Node, "node">
        server?: GenericResponse<ApplicationServer, "server">
    }
}
