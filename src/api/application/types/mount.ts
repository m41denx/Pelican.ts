import type {Nullable} from "@/utils/types"

export type Mount = {
    id: number
    uuid: string
    name: string
    description: Nullable<string>
    source: string
    target: string
    read_only: boolean
    user_mountable: boolean
}
