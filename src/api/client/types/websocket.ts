/*
 * @author BothimTV
 * @license MIT
 */

export type ServerStatus = "starting" | "stopping" | "online" | "offline"

export enum SERVER_SIGNAL {
    START = "start",
    STOP = "stop",
    RESTART = "restart",
    KILL = "kill"
}

export type WebsocketEvent =
    | AuthSuccessWsEvent
    | StatusWsEvent
    | ConsoleLogWsEvent
    | StatsWsEvent
    | TokenExpiringWsEvent
    | TokenExpiredWsEvent
    | DaemonErrorEvent
    | DaemonMessageEvent
    | InstallOutputEvent
    | InstallStartedEvent
    | InstallCompletedEvent
    | TransferLogsEvent
    | TransferStatusEvent
    | BackupCompletedEvent
    | BackupRestoreCompletedEvent
    | JwtErrorEvent

/**
 * Source: https://github.com/pterodactyl/panel/blob/1.0-develop/resources/scripts/components/server/events.ts
 */
export enum SOCKET_EVENT {
    AUTH_SUCCESS = "auth success",
    DAEMON_MESSAGE = "daemon message",
    DAEMON_ERROR = "daemon error",
    INSTALL_OUTPUT = "install output",
    INSTALL_STARTED = "install started",
    INSTALL_COMPLETED = "install completed",
    CONSOLE_OUTPUT = "console output",
    STATUS = "status",
    STATS = "stats",
    TRANSFER_LOGS = "transfer logs",
    TRANSFER_STATUS = "transfer status",
    BACKUP_COMPLETED = "backup completed",
    BACKUP_RESTORE_COMPLETED = "backup restore completed",
    TOKEN_EXPIRING = "token expiring",
    TOKEN_EXPIRED = "token expired",
    JWT_ERROR = "jwt error"
}

export type InstallOutputEvent = {
    event: SOCKET_EVENT.INSTALL_OUTPUT
    args: [string]
}

export type InstallStartedEvent = {event: SOCKET_EVENT.INSTALL_STARTED}

export type InstallCompletedEvent = {event: SOCKET_EVENT.INSTALL_COMPLETED}

export type TransferLogsEvent = {
    event: SOCKET_EVENT.TRANSFER_LOGS
    args: [string]
}

export type TransferStatusEvent = {
    event: SOCKET_EVENT.TRANSFER_STATUS
    args: [string]
}

export type BackupCompletedEvent = {
    event: SOCKET_EVENT.BACKUP_COMPLETED
    args: [string]
}

export type BackupCompletedJson = {
    checksum: string
    checksum_type: "sha1"
    file_size: number
    is_successful: boolean
    uuid: string
}

export type BackupRestoreCompletedEvent = {
    event: SOCKET_EVENT.BACKUP_RESTORE_COMPLETED
}

export type AuthSuccessWsEvent = {event: SOCKET_EVENT.AUTH_SUCCESS}

export type StatusWsEvent = {event: SOCKET_EVENT.STATUS; args: [PowerState]}

export type PowerState = "starting" | "stopping" | "running" | "offline"

export type ConsoleLogWsEvent = {
    event: SOCKET_EVENT.CONSOLE_OUTPUT
    args: [string]
}

export type StatsWsEvent = {event: SOCKET_EVENT.STATS; args: [string]}

export type StatsWsJson = {
    memory_bytes: number
    memory_limit_bytes: number
    cpu_absolute: number
    network: {rx_bytes: number; tx_bytes: number}
    state: PowerState
    uptime: number
    disk_bytes: number
}

export type TokenExpiringWsEvent = {event: SOCKET_EVENT.TOKEN_EXPIRING}

export type TokenExpiredWsEvent = {event: SOCKET_EVENT.TOKEN_EXPIRED}

/**
 * Example:
 * {"event":"daemon message","args":["(restoring): file1.yml"]}
 * {"event":"daemon message","args":["(restoring): file2"]}
 * {"event":"daemon message","args":["(restoring): file3.jar"]}
 * {"event":"daemon message","args":["(restoring): file5.tar.gz"]}
 * {"event":"daemon message","args":["Completed server restoration from local backup."]}
 */
export type DaemonMessageEvent = {
    event: SOCKET_EVENT.DAEMON_MESSAGE
    args: [string]
}

export type DaemonErrorEvent = {
    event: SOCKET_EVENT.DAEMON_ERROR
    args: [string]
}

export type JwtErrorEvent = {event: SOCKET_EVENT.JWT_ERROR; args: [string]}

export {ServerWebsocket} from "@/api/client/server_websocket"
