import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Allocation} from "@/api/application/types/server_allocation";
import {Location} from "@/api/application/types/location";
import {ApplicationServer} from "@/api/application/types/server";
import {Nullable} from "@/utils/types";


export type Node = {
    id: number,
    uuid: string,
    public: boolean,
    name: string,
    description: Nullable<string>,
    fqdn: string,
    scheme: "https" | "http",
    behind_proxy: boolean,
    maintenance_mode: boolean,
    memory: number,
    memory_overallocate: number,
    disk: number,
    disk_overallocate: number,
    cpu: number,
    cpu_overallocate: number,
    upload_size: number,
    daemon_listen: number,
    daemon_sftp: number,
    daemon_sftp_alias: Nullable<string>,
    daemon_base: string,
    daemon_connect: number,
    created_at: string,
    updated_at: Nullable<string>,
    tags: string[],
    allocated_resources: {
        memory: number,
        disk: number,
        cpu: number
    },
    relationships?: {
        allocations?: GenericListResponse<GenericResponse<Allocation, "allocation">>,
        location?: GenericResponse<Location, "location">,
        servers?: GenericListResponse<GenericResponse<ApplicationServer, "server">>
    }
}

export type NodeConfiguration = {
    debug: boolean,
    uuid: string,
    token_id: string,
    token: string,
    api: {
        host: string,
        port: number,
        upload_limit: number,
        ssl: {
            enabled: boolean,
            cert: string,
            key: string
        }
    },
    system: {
        data: string,
        sftp: {
            bind_port: number,
        }
    },
    allowed_mounts: string[],
    remote: string
}