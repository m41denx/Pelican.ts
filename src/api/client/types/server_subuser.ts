export type ServerSubuser = {
    uuid: string,
    username: string,
    email: string,
    language: string,
    image: string,
    admin: false,
    root_admin: false,
    "2fa_enabled": boolean,
    created_at: string,
    permissions: SubuserPermission[] | string[]
}


export type SubuserPermission =
    | "activity.read"
    | "allocation.create"
    | "allocation.delete"
    | "allocation.read"
    | "allocation.update"
    | "backup.create"
    | "backup.delete"
    | "backup.download"
    | "backup.read"
    | "backup.restore"
    | "control.console"
    | "control.restart"
    | "control.start"
    | "control.stop"
    | "database.create"
    | "database.delete"
    | "database.read"
    | "database.update"
    | "database.view-password"
    | "file.archive"
    | "file.create"
    | "file.delete"
    | "file.read"
    | "file.read-content"
    | "file.sftp"
    | "file.update"
    | "schedule.create"
    | "schedule.delete"
    | "schedule.read"
    | "schedule.update"
    | "settings.description"
    | "settings.reinstall"
    | "settings.rename"
    | "startup.docker-image"
    | "startup.read"
    | "startup.update"
    | "user.create"
    | "user.delete"
    | "user.read"
    | "user.update"
    | "websocket.connect"