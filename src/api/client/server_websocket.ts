import {AxiosInstance} from "axios"
import {EventEmitter} from "events"
import WebSocket from "isomorphic-ws"
import stripColor from "strip-color"
import {
    BackupCompletedJson,
    PowerState,
    SOCKET_EVENT,
    StatsWsJson,
    WebsocketEvent
} from "@/api/client/types/websocket";
import {ServerSignalOption} from "@/api/common/types/server_power";

const isBrowser = typeof window !== "undefined"


type WebsocketHandshakePayload = {
    data: {
        token: string
        socket: string
    }
}

type SocketEventPayloadMap = {
    [SOCKET_EVENT.AUTH_SUCCESS]: undefined
    [SOCKET_EVENT.STATUS]: PowerState
    [SOCKET_EVENT.CONSOLE_OUTPUT]: string
    [SOCKET_EVENT.STATS]: StatsWsJson
    [SOCKET_EVENT.DAEMON_ERROR]: undefined
    [SOCKET_EVENT.DAEMON_MESSAGE]: string
    [SOCKET_EVENT.INSTALL_OUTPUT]: string
    [SOCKET_EVENT.INSTALL_STARTED]: undefined
    [SOCKET_EVENT.INSTALL_COMPLETED]: undefined
    [SOCKET_EVENT.TRANSFER_LOGS]: string
    [SOCKET_EVENT.TRANSFER_STATUS]: string
    [SOCKET_EVENT.BACKUP_COMPLETED]: BackupCompletedJson
    [SOCKET_EVENT.BACKUP_RESTORE_COMPLETED]: undefined
    [SOCKET_EVENT.TOKEN_EXPIRING]: undefined
    [SOCKET_EVENT.TOKEN_EXPIRED]: undefined
    [SOCKET_EVENT.JWT_ERROR]: string
}

type Listener<E extends SOCKET_EVENT> = SocketEventPayloadMap[E] extends undefined
    ? () => void
    : (payload: SocketEventPayloadMap[E]) => void

type MessageEventLike = {data?: unknown}

type CloseEventLike = Parameters<NonNullable<WebSocket["onclose"]>>[0]

type ErrorEventLike = Parameters<NonNullable<WebSocket["onerror"]>>[0]

const RECONNECT_ERRORS = new Set([
    "jwt: exp claim is invalid",
    "jwt: created too far in past (denylist)",
])

const FALLBACK_LOG_MESSAGE = "No logs - is the server online?"

export class ServerWebsocket {
    private readonly r: AxiosInstance
    private readonly serverId: string
    private socket?: WebSocket
    private currentToken?: string
    private readonly bus = new EventEmitter()
    private debugLogging = false
    private stripColors: boolean
    private detachMessageListener?: () => void

    constructor(requester: AxiosInstance, id: string, stripColors: boolean = false) {
        this.r = requester
        this.serverId = id
        this.stripColors = stripColors
    }

    public on<E extends SOCKET_EVENT>(event: E, listener: Listener<E>): () => void {
        const handler = listener as (...args: unknown[]) => void
        this.bus.on(event, handler)
        return () => {
            this.bus.removeListener(event, handler)
        }
    }

    public deregister<E extends SOCKET_EVENT>(event: E, listener: Listener<E>): void {
        const handler = listener as (...args: unknown[]) => void
        this.bus.removeListener(event, handler)
    }

    private emit<E extends SOCKET_EVENT>(event: E, ...args: SocketEventPayloadMap[E] extends undefined ? [] : [SocketEventPayloadMap[E]]): void {
        if (args.length === 0) {
            this.bus.emit(event)
        } else {
            this.bus.emit(event, args[0])
        }
    }

    public async connect(resumable?: boolean, debugLogging?: boolean): Promise<void> {
        this.debugLogging = debugLogging ?? false

        if (this.socket) {
            return
        }

        const socketUrl = await this.refreshCredentials()

        this.socket = isBrowser
            ? new WebSocket(socketUrl)
            : new WebSocket(socketUrl, undefined, {origin: new URL(socketUrl).origin})

        await new Promise<void>((resolve, reject) => {
            const socket = this.socket
            if (!socket) {
                reject(new Error("Failed to create socket connection"))
                return
            }

            socket.onopen = async () => {
                try {
                    await this.authenticate()
                    this.attachMessageListener()
                    socket.onopen = null
                    socket.onerror = null
                    resolve()
                } catch (error) {
                    socket.onopen = null
                    socket.onerror = null
                    reject(error instanceof Error ? error : new Error("Websocket authentication failed"))
                }
            }

            socket.onerror = (event: ErrorEventLike) => {
                socket.onopen = null
                socket.onerror = null
                reject(event instanceof Error ? event : new Error("Websocket connection error"))
            }
        })

        if (resumable) {
            this.makeResumable(true)
        }
    }

    public onSocketDisconnect(handler: (event: CloseEventLike) => void): void {
        if (!this.socket) {
            console.error(new Error("No socket connection"))
            return
        }

        this.socket.onclose = handler
    }

    public onSocketError(handler: (event: ErrorEventLike) => void): void {
        if (!this.socket) {
            console.error(new Error("No socket connection"))
            return
        }

        this.socket.onerror = handler
    }

    public makeResumable(disconnectsToo: boolean): void {
        const scheduleReconnect = () => {
            setTimeout(() => {
                const previous = this.socket
                this.detachMessageListener?.()
                this.detachMessageListener = undefined
                this.socket = undefined
                previous?.close()
                void this.connect(true, this.debugLogging)
            }, 1000)
        }

        this.onSocketError(() => scheduleReconnect())

        if (disconnectsToo) {
            this.onSocketDisconnect(() => scheduleReconnect())
        }
    }

    private attachMessageListener(): void {
        if (!this.socket) {
            throw new Error("No socket connection")
        }

        this.detachMessageListener?.()

        const handler = (event: unknown) => {
            void this.handleIncomingMessage(event)
        }

        if (typeof this.socket.addEventListener === "function") {
            this.socket.addEventListener("message", handler as (event: MessageEventLike) => void)
            this.detachMessageListener = () => {
                this.socket?.removeEventListener?.("message", handler as (event: MessageEventLike) => void)
            }
        } else {
            const fallback = (data: unknown) => handler({data} satisfies MessageEventLike)
            const socket = this.socket as unknown as {
                on?: (event: string, listener: (data: unknown) => void) => void
                off?: (event: string, listener: (data: unknown) => void) => void
                removeListener?: (event: string, listener: (data: unknown) => void) => void
            }

            socket.on?.("message", fallback)
            this.detachMessageListener = () => {
                const target = this.socket as unknown as typeof socket | undefined
                if (!target) {
                    return
                }

                if (typeof target.off === "function") {
                    target.off("message", fallback)
                } else if (typeof target.removeListener === "function") {
                    target.removeListener("message", fallback)
                }
            }
        }
    }

    private async handleIncomingMessage(event: unknown): Promise<void> {
        const message = this.parseMessage(event)
        if (!message) {
            return
        }

        try {
            await this.dispatchMessage(message)
        } catch (error) {
            if (this.debugLogging) {
                console.error("Error while handling websocket message", error)
            }
        }
    }

    private parseMessage(event: unknown): WebsocketEvent | null {
        const payload = this.normalisePayload(event)
        if (!payload) {
            return null
        }

        try {
            return JSON.parse(payload) as WebsocketEvent
        } catch (error) {
            if (this.debugLogging) {
                console.warn("Failed to parse websocket payload", error)
            }
            return null
        }
    }

    private normalisePayload(event: unknown): string | null {
        if (typeof event === "string") {
            return event
        }

        if (typeof event === "object" && event !== null && "data" in event) {
            return this.normalisePayload((event as MessageEventLike).data)
        }

        if (typeof Buffer !== "undefined" && Buffer.isBuffer(event)) {
            return event.toString("utf8")
        }

        if (typeof ArrayBuffer !== "undefined" && event instanceof ArrayBuffer) {
            if (typeof TextDecoder !== "undefined") {
                return new TextDecoder().decode(new Uint8Array(event))
            }

            if (typeof Buffer !== "undefined") {
                return Buffer.from(event).toString("utf8")
            }
        }

        return null
    }

    private async dispatchMessage(message: WebsocketEvent): Promise<void> {
        switch (message.event) {
            case SOCKET_EVENT.AUTH_SUCCESS: {
                if (this.debugLogging) {
                    console.debug("Auth success")
                }
                this.emit(SOCKET_EVENT.AUTH_SUCCESS)
                break
            }
            case SOCKET_EVENT.STATUS: {
                if (this.debugLogging) {
                    console.debug("Received status event", message.args[0])
                }
                this.emit(SOCKET_EVENT.STATUS, message.args[0])
                break
            }
            case SOCKET_EVENT.CONSOLE_OUTPUT: {
                let output = message.args[0]
                if (this.stripColors) {
                    output = stripColor(output)
                }
                if (this.debugLogging) {
                    console.debug("Received console output", output)
                }
                this.emit(SOCKET_EVENT.CONSOLE_OUTPUT, output)
                break
            }
            case SOCKET_EVENT.STATS: {
                try {
                    const payload = JSON.parse(message.args[0]) as StatsWsJson
                    this.emit(SOCKET_EVENT.STATS, payload)
                } catch (error) {
                    if (this.debugLogging) {
                        console.warn("Failed to parse stats payload", error)
                    }
                }
                break
            }
            case SOCKET_EVENT.DAEMON_ERROR: {
                this.emit(SOCKET_EVENT.DAEMON_ERROR)
                break
            }
            case SOCKET_EVENT.BACKUP_COMPLETED: {
                try {
                    const payload = JSON.parse(message.args[0]) as BackupCompletedJson
                    this.emit(SOCKET_EVENT.BACKUP_COMPLETED, payload)
                } catch (error) {
                    if (this.debugLogging) {
                        console.warn("Failed to parse backup payload", error)
                    }
                }
                break
            }
            case SOCKET_EVENT.DAEMON_MESSAGE: {
                let output = message.args[0]
                if (this.stripColors) {
                    output = stripColor(output)
                }
                this.emit(SOCKET_EVENT.DAEMON_MESSAGE, output)
                break
            }
            case SOCKET_EVENT.INSTALL_OUTPUT: {
                let output = message.args[0]
                if (this.stripColors) {
                    output = stripColor(output)
                }
                this.emit(SOCKET_EVENT.INSTALL_OUTPUT, output)
                break
            }
            case SOCKET_EVENT.BACKUP_RESTORE_COMPLETED: {
                this.emit(SOCKET_EVENT.BACKUP_RESTORE_COMPLETED)
                break
            }
            case SOCKET_EVENT.INSTALL_COMPLETED: {
                this.emit(SOCKET_EVENT.INSTALL_COMPLETED)
                break
            }
            case SOCKET_EVENT.INSTALL_STARTED: {
                this.emit(SOCKET_EVENT.INSTALL_STARTED)
                break
            }
            case SOCKET_EVENT.TRANSFER_LOGS: {
                this.emit(SOCKET_EVENT.TRANSFER_LOGS, message.args[0])
                break
            }
            case SOCKET_EVENT.TRANSFER_STATUS: {
                this.emit(SOCKET_EVENT.TRANSFER_STATUS, message.args[0])
                break
            }
            case SOCKET_EVENT.TOKEN_EXPIRING: {
                this.emit(SOCKET_EVENT.TOKEN_EXPIRING)
                if (this.debugLogging) {
                    console.warn("Token expiring, renewing...")
                }
                await this.refreshCredentials()
                await this.authenticate()
                break
            }
            case SOCKET_EVENT.TOKEN_EXPIRED: {
                this.emit(SOCKET_EVENT.TOKEN_EXPIRED)
                throw new Error("Token expired")
            }
            case SOCKET_EVENT.JWT_ERROR: {
                const reason = message.args[0]
                if (RECONNECT_ERRORS.has(reason)) {
                    this.emit(SOCKET_EVENT.TOKEN_EXPIRING)
                    if (this.debugLogging) {
                        console.warn("Token expiring (JWT error), renewing...")
                    }
                    await this.refreshCredentials()
                    await this.authenticate()
                } else {
                    this.emit(SOCKET_EVENT.JWT_ERROR, reason)
                    throw new Error("Token expired")
                }
                break
            }
            default: {
                if (this.debugLogging) {
                    console.warn("Unknown websocket event", message)
                }
                break
            }
        }
    }

    private async refreshCredentials(): Promise<string> {
        const {data} = await this.r.get<WebsocketHandshakePayload>(`/servers/${this.serverId}/websocket`)
        this.currentToken = data.data.token
        return data.data.socket
    }

    private async authenticate(): Promise<void> {
        if (!this.socket) {
            throw new Error("No socket connection")
        }

        if (!this.currentToken) {
            throw new Error("Missing websocket token")
        }

        this.socket.send(JSON.stringify({event: "auth", args: [this.currentToken]}))
    }

    public disconnect(): void {
        this.detachMessageListener?.()
        this.detachMessageListener = undefined
        if (this.socket) {
            this.socket.close()
            this.socket = undefined
        }
    }

    public requestStats(): void {
        this.send("send stats", [null])
    }

    public requestLogs(): void {
        this.send("send logs", [null])
    }

    private send(event: string, args: unknown[]): void {
        if (!this.socket) {
            if (this.debugLogging) {
                console.warn(`Attempted to send "${event}" without an active websocket connection`)
            }
            return
        }

        this.socket.send(JSON.stringify({event, args}))
    }

    public getStats(): Promise<StatsWsJson> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("No socket connection"))
                return
            }

            let off: (() => void) | undefined
            const timeout = setTimeout(() => {
                off?.()
                reject(new Error("Timed out waiting for stats"))
            }, 5000)

            off = this.on(SOCKET_EVENT.STATS, (payload) => {
                clearTimeout(timeout)
                off?.()
                resolve(payload)
            })

            this.requestStats()
        })
    }

    public getLogs(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error("No socket connection"))
                return
            }

            const lines: string[] = []
            let off: (() => void) | undefined
            let initialTimeout: ReturnType<typeof setTimeout> | undefined
            let idleTimeout: ReturnType<typeof setTimeout> | undefined

            const finalize = (payload: string[]) => {
                off?.()
                if (initialTimeout) {
                    clearTimeout(initialTimeout)
                }
                if (idleTimeout) {
                    clearTimeout(idleTimeout)
                }
                resolve(payload)
            }

            initialTimeout = setTimeout(() => {
                finalize(lines.length > 0 ? lines : [FALLBACK_LOG_MESSAGE])
            }, 5000)

            off = this.on(SOCKET_EVENT.CONSOLE_OUTPUT, (line) => {
                lines.push(line)
                if (initialTimeout) {
                    clearTimeout(initialTimeout)
                    initialTimeout = undefined
                }
                if (idleTimeout) {
                    clearTimeout(idleTimeout)
                }
                idleTimeout = setTimeout(() => {
                    finalize(lines)
                }, 1000)
            })

            this.requestLogs()
        })
    }

    public sendPoweraction(action: ServerSignalOption): void {
        this.send("set state", [action])
    }

    public sendCommand(cmd: string): void {
        this.send("send command", [cmd])
    }
}
