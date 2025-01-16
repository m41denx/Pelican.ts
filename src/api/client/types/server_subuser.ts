export type ServerSubuser = {
    uuid: string,
    username: string,
    email: string,
    image: string,
    "2fa_enabled": boolean,
    created_at: string,
    permissions: SubuserPermission[] | string[]
}


export type SubuserPermission = (
    "control.console"
    | "control.start"
    | "control.stop"
    | "control.restart"
    | "user.create"
    | "user.update"
    | "user.delete"
    | "user.read"
    | "file.create"
    | "file.read"
    | "file.update"
    | "file.delete"
    | "file.archive"
    | "file.sftp"
    | "backup.create"
    | "backup.read"
    | "backup.delete"
    | "backup.update"
    | "backup.download"
    | "allocation.update"
    | "startup.update"
    | "startup.read"
    | "database.create"
    | "database.read"
    | "database.update"
    | "database.delete"
    | "database.view_password"
    | "schedule.create"
    | "schedule.read"
    | "schedule.update"
    | "settings.rename"
    | "schedule.delete"
    | "settings.reinstall"
    | "websocket.connect"
    )
