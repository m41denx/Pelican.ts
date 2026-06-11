import type {AxiosInstance} from "axios"

export class Plugins {
    private readonly r: AxiosInstance

    constructor(r: AxiosInstance) {
        this.r = r
    }

    // list = () => this.r.get<Plugin[]>("/plugins");
}
