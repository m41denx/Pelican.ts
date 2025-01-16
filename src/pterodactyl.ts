import {Client} from "@/api/client/client";
import {Agent} from "@/api/base/request";

export class PterodactylClient extends Client{
    constructor(url: string, token: string) {
        const ax = new Agent(url, token, "client")
        super(ax.requester)
    }
}

export class PterodactylApplication extends Client{
    constructor(url: string, token: string) {
        const ax = new Agent(url, token, "applications")
        super(ax.requester)
    }
}