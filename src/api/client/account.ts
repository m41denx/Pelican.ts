import type {AxiosInstance} from "axios"
import z from "zod"
import type {GenericListResponse, GenericResponse} from "@/api/base/types"
import type {APIKey, SSHKey, User} from "@/api/client/types/user"

export class Account {
    private readonly r: AxiosInstance

    constructor(requester: AxiosInstance) {
        this.r = requester
    }

    info = async (): Promise<User> => {
        const {data} =
            await this.r.get<GenericResponse<User, "user">>("/account")
        return data.attributes
    }

    updateEmail = async (newEmail: string, password: string): Promise<void> => {
        newEmail = z.email().parse(newEmail)
        await this.r.put("/account/email", {email: newEmail, password})
    }

    updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        newPassword = z.string().min(8).parse(newPassword)
        await this.r.put("/account/password", {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPassword
        })
    }

    apiKeys = {
        list: async (): Promise<APIKey[]> => {
            const {data} =
                await this.r.get<
                    GenericListResponse<GenericResponse<APIKey, "api_key">>
                >("/account/api-keys")
            return data.data.map(k => k.attributes)
        },

        create: async (
            description: string,
            allowed_ips?: string[]
        ): Promise<APIKey & {secret_token: string}> => {
            allowed_ips = z.array(z.ipv4()).optional().parse(allowed_ips)
            const {data} = await this.r.post<
                GenericResponse<APIKey, "api_key", {secret_token: string}>
            >("/account/api-keys", {description, allowed_ips})
            return {...data.attributes, secret_token: data.meta!.secret_token}
        },

        delete: async (identifier: string): Promise<void> => {
            await this.r.delete(`/account/api-keys/${identifier}`)
        }
    }

    sshKeys = {
        list: async (): Promise<SSHKey[]> => {
            const {data} =
                await this.r.get<
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
            await this.r.delete(`/account/ssh-keys/${fingerprint}`)
        }
    }
}
