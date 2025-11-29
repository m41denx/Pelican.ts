import type {AxiosInstance} from "axios"
import z from "zod"
import type {Nullable} from "@/utils/types"

export class ServerSettings {
    private readonly r: AxiosInstance
    private readonly id: string

    constructor(requester: AxiosInstance, id: string) {
        this.r = requester
        this.id = id
    }

    rename = async (name: string): Promise<void> => {
        name = z.string().max(255).parse(name)
        await this.r.post(`/servers/${this.id}/settings/rename`, {name})
    }

    updateDescription = async (
        description: Nullable<string>
    ): Promise<void> => {
        await this.r.post(`/servers/${this.id}/settings/description`, {
            description
        })
    }

    reinstall = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/settings/reinstall`)
    }

    changeDockerImage = async (image: string): Promise<void> => {
        await this.r.put(`/servers/${this.id}/settings/docker-image`, {
            docker_image: image
        })
    }
}
