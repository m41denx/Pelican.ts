export type GenericResponse<T, N = string, M = undefined> = {
    object: N,
    attributes: T,
    meta?: M
}

type PaginationMeta = {
    total: number,
    count: number,
    per_page: number,
    current_page: number,
    total_pages: number,
    links: any
}

export type GenericListResponse<T> = {
    object: "list",
    data: T[],
    meta?: { pagination: PaginationMeta }
}

export type CustomListResponse<T, M> = {
    object: "list",
    data: T[],
    meta?: M
}


export class PterodactylException extends Error {
    data: PterodactylError[]
    status: number

    constructor(message: string, data: PterodactylError[], status: number) {
        super(message)
        this.data = data
        this.status = status
    }
}

export type PterodactylError = {
    code: string,
    status?: number,
    detail: string,
    source?: {
        [key: string]: string
    }
}