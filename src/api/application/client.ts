import {AxiosInstance} from "axios";
import {Users} from "@/api/application/users";

export class Client {
    private readonly r: AxiosInstance
    users: Users

    constructor(requester: AxiosInstance) {
        this.r = requester

        this.users = new Users(requester)
    }
}