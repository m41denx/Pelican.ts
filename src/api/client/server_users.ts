import {AxiosInstance} from "axios";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {ServerSubuser, SubuserPermission} from "@/api/client/types/server_subuser";

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

    create = async (email: string, permissions: SubuserPermission[] | string[]): Promise<ServerSubuser> => {
        const {data} = await this.r.post<
            GenericResponse<ServerSubuser, "user">
        >(`/servers/${this.id}/users`, {email, permissions})
        return data.attributes
    }

    info = async (user_id: number): Promise<ServerSubuser> => {
        const {data} = await this.r.get<
            GenericResponse<ServerSubuser, "user">
        >(`/servers/${this.id}/users/${user_id}`)
        return data.attributes
    }

    update = async (user_id: number, permissions: SubuserPermission[] | string[]): Promise<ServerSubuser> => {
        const {data} = await this.r.put<
            GenericResponse<ServerSubuser, "user">
        >(`/servers/${this.id}/users/${user_id}`, {permissions})
        return data.attributes
    }

    delete = async (user_id: number): Promise<void> => {
        await this.r.delete(`/servers/${this.id}/users/${user_id}`)
    }

}