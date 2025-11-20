import { PelicanAPIClient } from "@/api"
import { Client as UserClient } from "@/humane/Client"

export const createPelicanClient = (
    url: string,
    token: string,
    suffix: string = "/api",
) => {
    const client = new PelicanAPIClient(url, token, suffix)
    return new UserClient(client)
}
