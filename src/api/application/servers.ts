import {AxiosInstance} from "axios";
import z from "zod";
import {GenericResponse} from "@/api/base/types";
import {ApplicationServer} from "@/api/application/types/server";
import {ServersDatabases} from "@/api/application/servers_databases";

export class Servers {
    private readonly r: AxiosInstance
    private readonly id: number
    databases: ServersDatabases

    constructor(r: AxiosInstance, server_id: number) {
        this.r = r
        this.id = server_id

        this.databases = new ServersDatabases(this.r, this.id)
    }

    info = async (include?: ("egg" | "subusers")[]): Promise<ApplicationServer> => {
        const {data} = await this.r.get<GenericResponse<ApplicationServer, "server">>(`/servers/${this.id}`, {
            params: {include: include?.join(",")}
        })
        return data.attributes
    }

    delete = async (force: boolean = false) => {
        await this.r.delete(`/servers/${this.id}${force ? "/force" : ""}`)
    }

    updateDetails = async (opts: z.infer<typeof UpdateDetailsSchema>): Promise<void> => {
        opts = UpdateDetailsSchema.parse(opts)
        await this.r.patch(`/servers/${this.id}/details`, opts)
    }

    updateBuild = async (opts: z.infer<typeof UpdateBuildSchema>): Promise<void> => {
        opts = UpdateBuildSchema.parse(opts)
        await this.r.patch(`/servers/${this.id}/build`, opts)
    }

    updateStartup = async (opts: z.infer<typeof UpdateStartupSchema>): Promise<void> => {
        opts = UpdateStartupSchema.parse(opts)
        await this.r.patch(`/servers/${this.id}/startup`, opts)
    }

    suspend = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/suspend`)
    }

    unsuspend = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/unsuspend`)
    }

    reinstall = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/reinstall`)
    }

    transferStart = async (
        node_id: number,
        allocation_id: number,
        allocation_additional?: string[]
    ): Promise<void> => {
        await this.r.post(`/servers/${this.id}/transfer`, {
            node_id,
            allocation_id,
            allocation_additional
        })
    }

    transferCancel = async (): Promise<void> => {
        await this.r.post(`/servers/${this.id}/transfer/cancel`)
    }
}


export const CreateServerSchema = z.object({
    external_id: z.string().min(1).max(255).optional(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    user: z.number(),
    egg: z.number(),
    docker_image: z.string().optional(),
    startup: z.string().optional(),
    environment: z.array(z.string()),
    skip_scripts: z.boolean().optional(),
    oom_killer: z.boolean().optional(),
    start_on_completion: z.boolean().optional(),
    docker_labels: z.record(z.string(), z.string()).optional(),
    limits: z.object({
        memory: z.number().min(0),
        swap: z.number().min(-1),
        disk: z.number().min(0),
        io: z.number().min(0),
        threads: z.string().optional(),
        cpu: z.number().min(0)
    }),
    feature_limits: z.object({
        databases: z.number().min(0),
        allocations: z.number().min(0),
        backups: z.number().min(0)
    }),
    allocation: z.object({
        default: z.string(),
        additional: z.array(z.string()).optional()
    }).optional(),
    deploy: z.object({
        tags: z.array(z.string()).optional(),
        dedicated_ip: z.boolean().optional(),
        port_range: z.array(z.string()).optional()
    }).optional()
})

const UpdateDetailsSchema = CreateServerSchema.pick({
    external_id: true,
    name: true,
    user: true,
    description: true,
    docker_labels: true
})

const UpdateBuildSchema = CreateServerSchema.pick({
    oom_killer: true,
    limits: true,
    feature_limits: true,
}).extend({
    allocation: z.number().optional(),
    add_allocations: z.array(z.string()).optional(),
    remove_allocations: z.array(z.string()).optional(),
})

const UpdateStartupSchema = CreateServerSchema.pick({
    startup: true,
    environment: true,
    egg: true,
    skip_scripts: true
}).extend({
    image: z.string().optional()
})