import {Nullable} from "@/utils/types";

export type Egg = {
    id: number,
    uuid: string,
    name: number,
    author: string,
    description: string,
    features: string[],
    tags: string[],
    docker_image: string,
    docker_images: Record<string, string>,
    config: {
        files: Record<string, FileConfig>
        startup: Record<string, string>,
        stop: string,
        logs: object | [],
        file_denylist: string[],
        extends: Nullable<number>
    },
    startup: string,
    startup_commands: Record<string, string>,
    script: {
        privileged: boolean,
        install: string,
        entry: string,
        container: string,
        extends: Nullable<number>
    },
    created_at: string,
    updated_at: Nullable<string>
}

type FileConfig = {
    parser: string,
    find: Record<string, string>
}