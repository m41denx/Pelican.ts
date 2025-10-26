import z from "zod"
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {PterodactylError, PterodactylException} from "@/api/base/types";

export class Agent {
    private readonly base_url: string
    private readonly token: string
    readonly requester: AxiosInstance

    constructor(url: string, token: string, type: "client" | "applications") {
        this.base_url = z.url("Invalid URL Schema").parse(url)
        this.token = z.string().regex(/^(ptl[ac]|pacc|papp)_.+$/, "Invalid token type").parse(token)

        this.requester = axios.create({
            baseURL: this.base_url.replace(/\/+$/, "")+`/api/${type}`,
            timeout: 3000,
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })

        this.requester.interceptors.response.use(undefined, (error: any)=>{
            if (error.response && error.response.status === 400) {
                return Promise.reject(new PterodactylException(
                    'Invalid request data',
                    error.response.data as PterodactylError[],
                    error.response.status
                ));
            }
            return Promise.reject(error);
        })
    }
}