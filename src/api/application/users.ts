import {AxiosInstance} from "axios";
import z from "zod";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {User} from "@/api/application/types/user";
import {ArrayQueryParams, SortParam} from "@/utils/transform";
import {ExactlyOneKey} from "@/utils/types";


export class Users {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    list = async (
        {...opts}: ListType,
        page: number = 1
    ): Promise<User[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<User, "user">>
        >("/application/users", {
            params: {
                include: opts.include?.join(","),
                page,
                ...ArrayQueryParams({filters: opts.filters || {}}),
                sort: opts.sort?.id
                    ? SortParam("id", opts.sort?.id)
                    : SortParam("uuid", opts.sort?.uuid!)
            }
        })

        return data.data.map(d => d.attributes)
    }

    info = async (
        id: number,
        {include}: { include?: ("servers")[] }
    ): Promise<User> => {
        z.number().positive().parse(id)
        const {data} = await this.r.get<
            GenericResponse<User, "user">
        >(`/application/users/${id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    infoByExternal = async (
        external_id: string,
        {include}: { include?: ("servers")[] }
        ): Promise<User> => {
        const {data} = await this.r.get<
            GenericResponse<User, "user">
        >(`/application/users/external/${external_id}`)
        return data.attributes
    }

    create = async (user: CreateType): Promise<User> => {
        const {data} = await this.r.post<
            GenericResponse<User, "user">
        >("/application/users", user)
        return data.attributes
    }

    update = async (id: number, user: UpdateType): Promise<User> => {
        z.number().positive().parse(id)
        const {data} = await this.r.put<
            GenericResponse<User, "user">
        >(`/application/users/${id}`, user)
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.delete(`/application/users/${id}`)
    }

}

type ListType = {
    include?: ("servers")[],
    filters?: ListFilters,
    sort?: ListSort
}
type ListFilters = {
    [key in "email" | "uuid" | "username" | "external_id"]: string;
};

type ListSort = ExactlyOneKey<"id" | "uuid", "asc" | "desc">

type CreateType = {
    email: string,
    username: string,
    first_name: string,
    last_name: string
}

type UpdateType = CreateType & {
    language: string
    password: string
}