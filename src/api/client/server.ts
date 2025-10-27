import {AxiosInstance} from "axios";
import {GenericResponse} from "@/api/base/types";
import {Server, ServerStats} from "@/api/client/types/server";
import {ServerDatabases} from "@/api/client/server_databases";
import {ServerFiles} from "@/api/client/server_files";
import {ServerSchedules} from "@/api/client/server_schedules";
import {ServerAllocations} from "@/api/client/server_allocations";
import {ServerUsers} from "@/api/client/server_users";
import {ServerBackups} from "@/api/client/server_backups";
import {ServerStartup} from "@/api/client/server_startup";
import {ServerSettings} from "@/api/client/server_settings";
import {ServerWebsocket} from "@/api/client/server_websocket";
import {ServerActivity} from "@/api/client/server_activity";


export class ServerClient {
    private readonly r: AxiosInstance
    private readonly id: string

    activity: ServerActivity
    databases: ServerDatabases
    files: ServerFiles
    schedules: ServerSchedules
    allocations: ServerAllocations
    users: ServerUsers
    backups: ServerBackups
    startup: ServerStartup
    variables: ServerStartup
    settings: ServerSettings

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id

        this.activity = new ServerActivity(requester, id)
        this.databases = new ServerDatabases(requester, id)
        this.files = new ServerFiles(requester, id)
        this.schedules = new ServerSchedules(requester, id)
        this.allocations = new ServerAllocations(requester, id)
        this.users = new ServerUsers(requester, id)
        this.backups = new ServerBackups(requester, id)
        this.startup = new ServerStartup(requester, id)
        this.variables = this.startup // preferable
        this.settings = new ServerSettings(requester, id)
    }

    info = async (include?: ("egg" | "subusers")[]): Promise<Server> => {
        const {data} = await this.r.get<GenericResponse<Server, "server">>(`/servers/${this.id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    websocket = (stripColors: boolean = false): ServerWebsocket => {
        return new ServerWebsocket(this.r, this.id, stripColors)
    }

    resources = async (): Promise<ServerStats> => {
        const {data} = await this.r.get<GenericResponse<ServerStats, "stats">>(`/servers/${this.id}/resources`)
        return data.attributes
    }

    command = async (command: string): Promise<void> => {
        await this.r.post(`/servers/${this.id}/command`, {command})
    }

    power = async (signal: "start" | "stop" | "restart" | "kill"): Promise<void> => {
        await this.r.post(`/servers/${this.id}/power`, {signal})
    }
}