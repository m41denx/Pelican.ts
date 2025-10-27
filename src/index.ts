import {Client as UserClient} from "@/api/client/client";
import {Client as AppClient} from "@/api/application/client";
import {Agent} from "@/api/base/request";

export class PelicanClient extends UserClient{
    constructor(url: string, token: string, suffix: string = "/api") {
        const ax = new Agent(url, token, "client", suffix)
        super(ax.requester)
    }
}

export class PelicanApplication extends AppClient{
    constructor(url: string, token: string, suffix: string = "/api") {
        const ax = new Agent(url, token, "application", suffix)
        super(ax.requester)
    }
}