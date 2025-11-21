import type {ServerClient} from "@/api/client/server"
import type {ServerBackups} from "@/api/client/server_backups"
import type {ServerFiles} from "@/api/client/server_files"
import type {ServerSchedules} from "@/api/client/server_schedules"
import type {Server as ServerT} from "@/api/client/types/server"
import {ServerAllocation} from "@/humane/ServerAllocation"
import {ServerBackup} from "@/humane/ServerBackup"
import {ServerDatabase} from "@/humane/ServerDatabase"
import {ServerFile} from "@/humane/ServerFile"
import {ServerSchedule} from "@/humane/ServerSchedule"
import {ServerUser} from "@/humane/ServerUser"
import type {
    EggVariable,
    FeatureLimits,
    ServerLimits,
    SubuserPermission
} from "@/types"
import type {Nullable} from "@/utils/types"

export class Server {
    private readonly client: ServerClient

    readonly ownsServer: boolean
    readonly identifier: string
    readonly internalId?: number
    readonly uuid: string
    private $name: string
    get name() {
        return this.$name
    }
    readonly node: string
    readonly isNodeUnderMaintenance: boolean
    readonly sftp: {ip: string; alias: Nullable<string>; port: number}
    private $description: string
    get description() {
        return this.$description
    }
    readonly limits: ServerLimits
    readonly invocation: string
    private $dockerImage: string
    get dockerImage() {
        return this.$dockerImage
    }
    readonly eggFeatures: Nullable<string[]>
    readonly featureLimits: FeatureLimits
    readonly status: unknown
    readonly isSuspended: boolean
    readonly isInstalling: boolean
    readonly isTransferring: boolean
    readonly allocations: ServerAllocation[]
    readonly variables: EggVariable[]
    readonly egg?: {uuid: string; name: string}
    readonly subusers?: ServerUser[]

    constructor(client: ServerClient, server: ServerT) {
        this.client = client
        this.ownsServer = server.server_owner
        this.identifier = server.identifier
        this.internalId = server.internal_id
        this.uuid = server.uuid
        this.$name = server.name
        this.node = server.node
        this.isNodeUnderMaintenance = server.is_node_under_maintenance
        this.sftp = server.sftp_details
        this.$description = server.description
        this.limits = server.limits
        this.invocation = server.invocation
        this.$dockerImage = server.docker_image
        this.eggFeatures = server.egg_features
        this.featureLimits = server.feature_limits
        this.status = server.status
        this.isSuspended = server.is_suspended
        this.isInstalling = server.is_installing
        this.isTransferring = server.is_transferring
        this.allocations = server.relationships.allocations.data.map(
            d => new ServerAllocation(this.client, d.attributes)
        )
        this.variables = server.relationships.variables.data.map(
            d => d.attributes
        )
        this.egg = server.relationships.egg?.attributes
        this.subusers = server.relationships.subusers?.data.map(
            d => new ServerUser(this.client, d.attributes)
        )
    }

    rename = async (name: string) => {
        await this.client.settings.rename(name)
        this.$name = name
    }

    updateDescription = async (description: string) => {
        await this.client.settings.updateDescription(description)
        this.$description = description
    }

    reinstall = async () => this.client.settings.reinstall()

    changeDockerImage = async (image: string) => {
        await this.client.settings.changeDockerImage(image)
        this.$dockerImage = image
    }

    getActivityLogs = async (
        opts: {page?: number; per_page?: number} = {page: 1, per_page: 50}
    ) => this.client.activity.list(opts.page, opts.per_page)

    websocket = (stripColors: boolean = false) =>
        this.client.websocket(stripColors)

    getServerStats = async () => this.client.resources()

    runCommand = async (command: string) => this.client.command(command)

    sendPowerSignal = async (signal: "start" | "stop" | "restart" | "kill") =>
        this.client.power(signal)

    getDatabases = async (
        opts: {include?: "password"[]; page?: number} = {include: [], page: 1}
    ) => {
        const data = await this.client.databases.list(opts.include, opts.page)
        return data.map(d => new ServerDatabase(this.client, d))
    }

    createDatabase = async (database: string, remote: string) => {
        const data = await this.client.databases.create(database, remote)
        return new ServerDatabase(this.client, data)
    }

    getSchedules = async () => {
        const data = await this.client.schedules.list()
        return data.map(d => new ServerSchedule(this.client, d))
    }

    createSchedule = async (...opts: Parameters<ServerSchedules["create"]>) => {
        const data = await this.client.schedules.create(...opts)
        return new ServerSchedule(this.client, data)
    }

    getBackups = async (page: number = 1) => {
        const data = await this.client.backups.list(page)
        return data.map(d => new ServerBackup(this.client, d))
    }

    createBackup = async (...args: Parameters<ServerBackups["create"]>) => {
        const data = await this.client.backups.create(...args)
        return new ServerBackup(this.client, data)
    }

    getAllocations = async () => {
        const data = await this.client.allocations.list()
        return data.map(d => new ServerAllocation(this.client, d))
    }

    createAllocation = async () => {
        const data = await this.client.allocations.autoAssign()
        return new ServerAllocation(this.client, data)
    }

    getFiles = async (path?: string) => {
        const data = await this.client.files.list(path)
        return data.map(d => new ServerFile(this.client, d, path))
    }

    createFolder = async (...opts: Parameters<ServerFiles["createFolder"]>) =>
        this.client.files.createFolder(...opts)

    uploadFile = async (...opts: Parameters<ServerFiles["upload"]>) =>
        this.client.files.upload(...opts)

    uploadFileGetUrl = async (
        ...opts: Parameters<ServerFiles["uploadGetUrl"]>
    ) => this.client.files.uploadGetUrl(...opts)

    pullFileFromRemote = async (
        ...opts: Parameters<ServerFiles["pullFromRemote"]>
    ) => this.client.files.pullFromRemote(...opts)

    compressMultipleFiles = async (
        ...opts: Parameters<ServerFiles["compress"]>
    ) => this.client.files.compress(...opts)

    renameMultipleFiles = async (...opts: Parameters<ServerFiles["rename"]>) =>
        this.client.files.rename(...opts)

    deleteMultipleFiles = async (...opts: Parameters<ServerFiles["delete"]>) =>
        this.client.files.delete(...opts)

    getUsers = async () => {
        const data = await this.client.users.list()
        return data.map(d => new ServerUser(this.client, d))
    }

    createUser = async (
        email: string,
        permissions: SubuserPermission[] | string[]
    ) => {
        const data = await this.client.users.create(email, permissions)
        return new ServerUser(this.client, data)
    }

    getStartupInfo = async () => this.client.startup.list()

    setStartupVariable = async (key: string, value: string) =>
        this.client.startup.set(key, value)
}
