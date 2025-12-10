import type {Client} from "@/api/client/client"
import type {User} from "@/api/client/types/user"

/**
 * Instance of a Humane Pelican User
 *
 * @class
 * @example
 * You can create account from a raw client
 * ```ts
 * import {PelicanAPIClient} from "@pelican.ts/sdk/api"
 * const client = new PelicanAPIClient(...)
 * const userData = await client.account.info()
 * const account = new Account(client, userData)
 * ```
 */
export class Account {
    private readonly client: Client
    readonly uuid: string
    readonly username: string
    private $email: string
    get email() {
        return this.$email
    }
    readonly language: string
    readonly image: string
    readonly admin: boolean
    readonly root_admin: boolean
    private $has2faEnabled: boolean
    get has2faEnabled() {
        return this.$has2faEnabled
    }
    readonly createdAt: Date
    readonly updatedAt: Date

    constructor(client: Client, user: User) {
        this.client = client
        this.uuid = user.uuid
        this.username = user.username
        this.$email = user.email
        this.language = user.language
        this.image = user.image
        this.admin = user.admin
        this.root_admin = user.root_admin
        this.$has2faEnabled = user["2fa_enabled"]
        this.createdAt = new Date(user.created_at)
        this.updatedAt = new Date(user.updated_at)
    }

    updateEmail = async (newEmail: string, password: string) => {
        await this.client.account.updateEmail(newEmail, password)
        this.$email = newEmail
    }

    updatePassword = async (newPassword: string) =>
        this.client.account.updatePassword(newPassword)

    listApiKeys = async () => this.client.account.apiKeys.list()

    createApiKey = async (description: string, allowed_ips?: string[]) =>
        this.client.account.apiKeys.create(description, allowed_ips)

    deleteApiKey = async (identifier: string) =>
        this.client.account.apiKeys.delete(identifier)

    listSshKeys = async () => this.client.account.sshKeys.list()

    createSshKey = async (name: string, public_key: string) =>
        this.client.account.sshKeys.create(name, public_key)

    deleteSshKey = async (fingerprint: string) =>
        this.client.account.sshKeys.delete(fingerprint)
}
