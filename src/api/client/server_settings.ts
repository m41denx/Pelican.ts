import {AxiosInstance} from "axios";


export class ServerSettings {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    rename = async (name: string): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/settings/rename`, {name})
    }

    reinstall = async (): Promise<void> => {
        await this.r.post(`/client/servers/${this.id}/settings/reinstall`)
    }
}