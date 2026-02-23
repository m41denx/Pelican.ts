import {Client as AppClient} from "@/api/application/client"
import {Agent} from "@/api/base/request"
import {Client as UserClient} from "@/api/client/client"

export class PelicanAPIClient extends UserClient {
    constructor(url: string, token: string, suffix: string = "/api", timeout?: number) {
        const ax = new Agent(url, token, "client", suffix, timeout)
        super(ax.requester)
    }
}

export class PelicanAPIApplication extends AppClient {
    constructor(url: string, token: string, suffix: string = "/api", timeout?: number) {
        const ax = new Agent(url, token, "application", suffix, timeout)
        super(ax.requester)
    }
}
