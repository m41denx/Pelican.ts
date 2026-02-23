import type {AxiosInstance} from "axios"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {
    ServerSubuser,
    SubuserPermission
} from "@/api/client/types/server_subuser"

export class ServerUsers {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    list = async (): Promise<ServerSubuser[]> => {
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<ServerSubuser, "user">>
        >(`/servers/${this.id}/users`)
        return data.data.map(d => d.attributes)
    }

    create = async (
        email: string,
        permissions: SubuserPermission[] | string[]
    ): Promise<ServerSubuser> => {
        const {data} = await this.r.post<
            GenericResponse<ServerSubuser, "user">
        >(`/servers/${this.id}/users`, {email, permissions})
        return data.attributes
    }

    info = async (user_uuid: string): Promise<ServerSubuser> => {
        const {data} = await this.r.get<GenericResponse<ServerSubuser, "user">>(
            `/servers/${this.id}/users/${user_uuid}`
        )
        return data.attributes
    }

    update = async (
        user_uuid: string,
        permissions: SubuserPermission[] | string[]
    ): Promise<ServerSubuser> => {
        const {data} = await this.r.post<GenericResponse<ServerSubuser, "user">>(
            `/servers/${this.id}/users/${user_uuid}`,
            {permissions}
        )
        return data.attributes
    }

    delete = async (user_uuid: string): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/users/${user_uuid}`)
    }
}
