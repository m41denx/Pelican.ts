import {AxiosInstance} from "axios";
import {APIKey, SSHKey, User} from "@/api/client/types/user";
import {GenericListResponse, GenericResponse} from "@/api/base/types";
import z from "zod";


export class Account {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    info = async (): Promise<User> => {
        const {data} = await this.r.get<GenericResponse<User, "user">>("/account")
        return data.attributes
    }

    updateEmail = async (newEmail: string, password: string): Promise<void> => {
        newEmail = z.email().parse(newEmail)
        await this.r.put("/account/email", {email: newEmail, password})
    }

    updatePassword = async (newPassword: string): Promise<void> => {
        newPassword = z.string().min(8).parse(newPassword)
        await this.r.put("/account/password", {
            password: newPassword,
            password_confirmation: newPassword
        })
    }

    apiKeys = {
        list: async (): Promise<APIKey[]> => {
            const {data} = await this.r.get<
                GenericListResponse<GenericResponse<APIKey, "api_key">>
            >("/account/api-keys")
            return data.data.map(k => k.attributes)
        },

        create: async (description: string, allowed_ips?: string[]): Promise<APIKey & { secret_token: string }> => {
            allowed_ips = z.array(z.ipv4()).optional().parse(allowed_ips)
            const {data} = await this.r.post<
                GenericResponse<APIKey, "api_key", { secret_token: string }>
            >("/account/api-keys", {description, allowed_ips})
            return {...data.attributes, secret_token: data.meta!.secret_token}
        },

        delete: async (identifier: string): Promise<void> => {
            await this.r.delete(`/account/api-keys/${identifier}`)
        }
    }

    sshKeys = {
        list: async (): Promise<SSHKey[]> => {
            const {data} = await this.r.get<
                GenericListResponse<GenericResponse<SSHKey, "ssh_key">>
            >("/account/ssh-keys")
            return data.data.map(k => k.attributes)
        },

        create: async (name: string, public_key: string): Promise<SSHKey> => {
            const {data} = await this.r.post<
                GenericResponse<SSHKey, "ssh_key">
            >("/account/ssh-keys", {name, public_key})
            return data.attributes
        },

        delete: async (fingerprint: string): Promise<void> => {
            await this.r.post(`/account/ssh-keys/remove`, {fingerprint})
        }
    }

    twoFactor = {
        info: async (): Promise<{ image_url_data: string }> => {
            const {data} = await this.r.get<
                Awaited<ReturnType<typeof this.twoFactor.info>>
            >("/account/two-factor")
            return data
        },

        enable: async (code: string): Promise<{ tokens: string[] }> => {
            const {data} = await this.r.post<
                Awaited<ReturnType<typeof this.twoFactor.enable>>
            >("/account/two-factor", {code})
            return data
        },

        disable: async (password: string): Promise<void> => {
            await this.r.delete("/account/two-factor", {data: {password}})
        }
    }
}