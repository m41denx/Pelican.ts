import {Nullable} from "@/utils/types"
import {EggVariable} from "@/api/common/types"

export type Egg = {
    id: number
    uuid: string
    name: string
    author: string
    description: string
    features: string[]
    tags: string[]
    docker_image: Nullable<string>
    docker_images: Record<string, string>
    config: {
        files: Record<string, FileConfig>
        startup: Record<string, string>
        stop: string
        logs: object | []
        file_denylist: string[]
        extends: Nullable<number>
    }
    startup: string
    startup_commands: Record<string, string>
    script: {
        privileged: boolean
        install: string
        entry: string
        container: string
        extends: Nullable<number>
    }
    created_at: string
    updated_at: Nullable<string>
}

type FileConfig = {parser: string; find: Record<string, string>}

export type ApplicationEggVariable = Omit<
    EggVariable,
    "server_value" | "is_editable" | "rules"
> & {
    rules: string[]
    sort: number
    user_viewable: boolean
    user_editable: boolean
}

export type ExportedEgg = {
    meta: {version: "PLCN_v3"; update_url: Nullable<string>}
    exported_at: string
    name: string
    author: string
    description: string
    uuid: string
    image: Nullable<string>
    docker_images: Record<string, string>
    features: string[]
    tags: string[]
    file_denylist: string[]
    startup_commands: Record<string, string>
    config: Omit<Egg["config"], "extends" | "file_denylist">
    scripts: {
        installation: {script: string; container: string; entrypoint: string}
    }
    variables: ApplicationEggVariable[]
}
