import {PelicanAPIClient} from "@/api"
import {Client as UserClient} from "@/humane/Client"

export const createPelicanClient = (
    url: string,
    token: string,
    suffix: string = "/api"
) => {
    const client = new PelicanAPIClient(url, token, suffix)
    return new UserClient(client)
}

export {Account} from "@/humane/Account"
export {Client} from "@/humane/Client"
export {Server} from "@/humane/Server"
export {ServerAllocation} from "@/humane/ServerAllocation"
export {ServerBackup} from "@/humane/ServerBackup"
export {ServerDatabase} from "@/humane/ServerDatabase"
export {ServerFile} from "@/humane/ServerFile"
export {ServerSchedule} from "@/humane/ServerSchedule"
export {ServerUser} from "@/humane/ServerUser"
