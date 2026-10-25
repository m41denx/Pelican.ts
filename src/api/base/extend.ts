import type {AxiosInstance} from "axios"

/**
 * Custom API class that can be mounted on a client with `$extend`.
 * It is constructed with the client's requester (axios instance).
 */
export type APIExtension<T = unknown> = new (requester: AxiosInstance) => T

/**
 * Client type `C` with extension `T` mounted under key `K`
 */
export type Extended<C, K extends PropertyKey, T extends APIExtension> = C & {
    readonly [P in K]: InstanceType<T>
}

export const mountExtension = (
    target: object,
    requester: AxiosInstance,
    key: PropertyKey,
    extension: APIExtension
) => {
    if (key in target) {
        throw new Error(`Cannot extend client: "${String(key)}" already exists`)
    }

    Object.defineProperty(target, key, {
        value: new extension(requester),
        enumerable: true
    })
}
