import {Nullable} from "@/utils/types";


export type Allocation = {
    id: number,
    ip: string,
    alias: Nullable<string>,
    port: number,
    notes: Nullable<string>,
    is_default: boolean
}