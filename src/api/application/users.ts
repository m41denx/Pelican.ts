import {AxiosInstance} from "axios";
import z from "zod";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {User} from "@/api/application/types/user";
import {ArrayQueryParams, SortParam} from "@/utils/transform";
import {ExactlyOneKey} from "@/utils/types";
import {languagesSchema, timezonesSchema} from "@/api/common/types/enums";


export class Users {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    list = async (
        opts: ListType,
        page: number = 1
    ): Promise<User[]> => {
        z.number().positive().parse(page)
        const {data} = await this.r.get<
            GenericListResponse<GenericResponse<User, "user">>
        >("/users", {
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
        >(`/users/${id}`, {
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
        >(`/users/external/${external_id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    create = async (user: z.infer<typeof CreateSchema>): Promise<User> => {
        user = CreateSchema.parse(user)
        const {data} = await this.r.post<
            GenericResponse<User, "user">
        >("/users", user)
        return data.attributes
    }

    update = async (id: number, user: z.infer<typeof CreateSchema>): Promise<User> => {
        user = CreateSchema.parse(user)
        const {data} = await this.r.patch<
            GenericResponse<User, "user">
        >(`/users/${id}`, user)
        return data.attributes
    }

    delete = async (id: number): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.delete(`/users/${id}`)
    }

    addRoles = async (id: number, roles: number[]): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.patch(`/users/${id}/roles/assign`, {roles})
    }

    removeRoles = async (id: number, roles: number[]): Promise<void> => {
        z.number().positive().parse(id)
        await this.r.patch(`/users/${id}/roles/remove`, {roles})
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

const CreateSchema = z.object({
    email: z.email(),
    external_id: z.string().max(255).optional(),
    username: z.string().min(1).max(255),
    password: z.string().optional(),
    language: languagesSchema,
    timezone: timezonesSchema
})