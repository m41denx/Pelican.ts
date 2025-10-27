import {GenericResponse} from "@/api/base/types";

export type ServerDatabase = {
    id: string,
    host: {
        address: string,
        port: number
    },
    name: string,
    username: string,
    connections_from: string,
    max_connections: number,
    relationships?: {
        password: GenericResponse<{ password: string }, "database_password">
    }
}