import type {ServerClient} from "@/api/client/server"
import type {
    ServerSubuser,
    SubuserPermission
} from "@/api/client/types/server_subuser"

export class ServerUser {
    private readonly client: ServerClient

    readonly uuid: string
    readonly username: string
    readonly email: string
    readonly language: string
    readonly image: string
    readonly admin: boolean
    readonly root_admin: boolean
    readonly has2faEnabled: boolean
    readonly createdAt: Date
    private $permissions: SubuserPermission[] | string[]
    get permissions() {
        return this.$permissions
    }

    constructor(client: ServerClient, user: ServerSubuser) {
        this.client = client
        this.uuid = user.uuid
        this.username = user.username
        this.email = user.email
        this.language = user.language
        this.image = user.image
        this.admin = user.admin
        this.root_admin = user.root_admin
        this.has2faEnabled = user["2fa_enabled"]
        this.createdAt = new Date(user.created_at)
        this.$permissions = user.permissions
    }

    update = async (permissions: SubuserPermission[] | string[]) => {
        const data = await this.client.users.update(this.uuid, permissions)
        this.$permissions = data.permissions
    }

    delete = async () => this.client.users.delete(this.uuid)
}
