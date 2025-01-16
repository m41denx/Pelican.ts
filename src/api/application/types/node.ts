import {GenericListResponse, GenericResponse} from "@/api/base/types";
import {Allocation} from "@/api/common/types/server_allocations";
import {Location} from "@/api/application/types/location";
import {Server} from "@/api/application/types/server";


export type Node = {
    id: number,
    uuid: string,
    public: boolean,
    name: string,
    description: string,
    location_id: number,
    fqdn: string,
    scheme: "https" | "http",
    behind_proxy: boolean,
    maintenance_mode: boolean,
    memory: number,
    memory_overallocate: number,
    disk: number,
    disk_overallocate: number,
    upload_size: number,
    daemon_listen: number,
    daemon_sftp: number,
    daemon_base: string,
    created_at: string,
    updated_at: string | null
    relationships?: {
        allocations?: GenericListResponse<GenericResponse<Allocation, "allocation">>,
        location?: GenericResponse<Location, "location">,
        servers?: GenericListResponse<GenericResponse<Server, "server">>
    }
}