import {AxiosInstance} from "axios"
import {GenericListResponse, GenericResponse} from "@/api/base/types"
import {Role} from "@/api/application/types/role"

// TODO: API is incomplete

export class Roles {
    private readonly r: AxiosInstance

    constructor(r: AxiosInstance) {
        this.r = r
    }

    list = async (page: number = 1): Promise<Role[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<Role, "role">>
        >(`/roles`, {params: {page}})
        return data.data.map(r => r.attributes)
    }

    info = async (id: number): Promise<Role> => {
        const {data} = await this.r.get<GenericResponse<Role, "role">>(
            `/roles/${id}`
        )
        return data.attributes
    }

    create = async (opts: {name: string}): Promise<void> => {
        await this.r.post(`/roles`, opts)
    }

    update = async (id: number, opts: {name: string}): Promise<void> => {
        await this.r.patch(`/roles/${id}`, opts)
    }

    delete = async (id: number): Promise<void> => {
        await this.r.delete(`/roles/${id}`)
    }
}
