import {AxiosInstance} from "axios";
import {Users} from "@/api/application/users";
import {Nodes} from "@/api/application/nodes";

export class Client {
    private readonly r: AxiosInstance
    users: Users
    nodes: Nodes

    constructor(requester: AxiosInstance) {
        this.r = requester

        this.users = new Users(requester)
        this.nodes = new Nodes(requester)
    }
}