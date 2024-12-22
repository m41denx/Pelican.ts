export type User = {
    id: number,
    admin: boolean,
    username: string,
    email: string,
    first_name: string,
    last_name: string,
    language: string
}

export type APIKey = {
    identifier: string,
    description: string,
    allowed_ips: string[],
    last_used_at: string,
    created_at: string
}

export type Permission = {
    description: string,
    keys: {
        [key: string]: string
    }
}