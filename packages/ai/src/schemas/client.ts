import {z} from "zod"

const serverUuid = z
    .string()
    .min(1)
    .describe("Server identifier (short UUID)")

const scheduleId = z
    .number()
    .int()
    .positive()
    .describe("Schedule numeric ID")

const eggSubusersInclude = z
    .array(z.enum(["egg", "subusers"]))
    .optional()
    .describe("Related resources to include")

const scheduleParams = z.object({
    name: z.string(),
    is_active: z.boolean().optional(),
    only_when_online: z.boolean().optional(),
    minute: z.string(),
    hour: z.string(),
    day_of_week: z.string(),
    month: z.string(),
    day_of_month: z.string()
})

const scheduleTaskOpts = z.object({
    action: z.string(),
    payload: z.string().optional(),
    time_offset: z.number(),
    sequence_id: z.number().optional(),
    continue_on_failure: z.boolean().optional()
})

const fileRenameEntry = z.object({
    from: z.string(),
    to: z.string()
})

const chmodEntry = z.object({
    file: z.string(),
    mode: z.number()
})

const archiveExtension = z.enum([
    "zip",
    "tgz",
    "tar.gz",
    "txz",
    "tar.xz",
    "tbz2",
    "tar.bz2"
])

/** Input schemas keyed by tool id. Server-scoped tools include serverUuid unless noted. */
export const CLIENT_TOOL_SCHEMAS = {
    pelican_client_listPermissions: z.object({}),

    pelican_client_listServers: z.object({
        type: z
            .enum(["accessible", "mine", "admin", "admin-all"])
            .optional()
            .describe("Server list filter"),
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        include: eggSubusersInclude
    }),

    pelican_client_account_info: z.object({}),

    pelican_client_account_updateEmail: z.object({
        newEmail: z.string().email(),
        password: z.string()
    }),

    pelican_client_account_updatePassword: z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8)
    }),

    pelican_client_account_apiKeys_list: z.object({}),

    pelican_client_account_apiKeys_create: z.object({
        description: z.string(),
        allowed_ips: z.array(z.string()).optional()
    }),

    pelican_client_account_apiKeys_delete: z.object({
        identifier: z.string()
    }),

    pelican_client_account_sshKeys_list: z.object({}),

    pelican_client_account_sshKeys_create: z.object({
        name: z.string(),
        public_key: z.string()
    }),

    pelican_client_account_sshKeys_delete: z.object({
        fingerprint: z.string()
    }),

    pelican_client_server_info: z.object({
        serverUuid,
        include: eggSubusersInclude
    }),

    pelican_client_server_resources: z.object({serverUuid}),

    pelican_client_server_command: z.object({
        serverUuid,
        command: z.string()
    }),

    pelican_client_server_power: z.object({
        serverUuid,
        signal: z.enum(["start", "stop", "restart", "kill"])
    }),

    pelican_client_server_activity_list: z.object({
        serverUuid,
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        sortByTimestamp: z.enum(["asc", "desc"]).optional(),
        includeActor: z.boolean().optional()
    }),

    pelican_client_server_databases_list: z.object({
        serverUuid,
        include: z.array(z.literal("password")).optional(),
        page: z.number().int().positive().optional()
    }),

    pelican_client_server_databases_create: z.object({
        serverUuid,
        database: z.string(),
        remote: z.string()
    }),

    pelican_client_server_databases_rotatePassword: z.object({
        serverUuid,
        database_id: z.string()
    }),

    pelican_client_server_databases_delete: z.object({
        serverUuid,
        database_id: z.string()
    }),

    pelican_client_server_files_list: z.object({
        serverUuid,
        path: z.string().optional()
    }),

    pelican_client_server_files_contents: z.object({
        serverUuid,
        path: z.string()
    }),

    pelican_client_server_files_downloadGetUrl: z.object({
        serverUuid,
        path: z.string()
    }),

    pelican_client_server_files_download: z.object({
        serverUuid,
        path: z.string()
    }),

    pelican_client_server_files_rename: z.object({
        serverUuid,
        root: z.string().optional(),
        files: z.array(fileRenameEntry)
    }),

    pelican_client_server_files_copy: z.object({
        serverUuid,
        location: z.string()
    }),

    pelican_client_server_files_write: z.object({
        serverUuid,
        path: z.string(),
        content: z.string()
    }),

    pelican_client_server_files_compress: z.object({
        serverUuid,
        root: z.string().optional(),
        files: z.array(z.string()),
        archive_name: z.string().optional(),
        extension: archiveExtension.optional()
    }),

    pelican_client_server_files_decompress: z.object({
        serverUuid,
        root: z.string().optional(),
        file: z.string()
    }),

    pelican_client_server_files_delete: z.object({
        serverUuid,
        root: z.string().optional(),
        files: z.array(z.string())
    }),

    pelican_client_server_files_createFolder: z.object({
        serverUuid,
        root: z.string().optional(),
        name: z.string()
    }),

    pelican_client_server_files_chmod: z.object({
        serverUuid,
        root: z.string().optional(),
        files: z.array(chmodEntry)
    }),

    pelican_client_server_files_pullFromRemote: z.object({
        serverUuid,
        url: z.string().url(),
        directory: z.string().optional(),
        filename: z.string().optional(),
        use_header: z.boolean().optional(),
        foreground: z.boolean().optional()
    }),

    pelican_client_server_files_uploadGetUrl: z.object({serverUuid}),

    pelican_client_server_files_upload: z.object({
        serverUuid,
        root: z.string().optional(),
        filename: z.string(),
        contentBase64: z
            .string()
            .describe("Base64-encoded file contents to upload")
    }),

    pelican_client_server_schedules_list: z.object({serverUuid}),

    pelican_client_server_schedules_create: z.object({
        serverUuid,
        params: scheduleParams
    }),

    pelican_client_server_schedules_control_info: z.object({
        serverUuid,
        scheduleId
    }),

    pelican_client_server_schedules_control_update: z.object({
        serverUuid,
        scheduleId,
        params: scheduleParams
    }),

    pelican_client_server_schedules_control_delete: z.object({
        serverUuid,
        scheduleId
    }),

    pelican_client_server_schedules_control_execute: z.object({
        serverUuid,
        scheduleId
    }),

    pelican_client_server_schedules_tasks_create: z.object({
        serverUuid,
        scheduleId,
        opts: scheduleTaskOpts
    }),

    pelican_client_server_schedules_tasks_update: z.object({
        serverUuid,
        scheduleId,
        task_id: z.number().int().positive(),
        opts: scheduleTaskOpts
    }),

    pelican_client_server_schedules_tasks_delete: z.object({
        serverUuid,
        scheduleId,
        task_id: z.number().int().positive()
    }),

    pelican_client_server_allocations_list: z.object({serverUuid}),

    pelican_client_server_allocations_autoAssign: z.object({serverUuid}),

    pelican_client_server_allocations_setNotes: z.object({
        serverUuid,
        alloc_id: z.number().int().positive(),
        notes: z.string()
    }),

    pelican_client_server_allocations_setPrimary: z.object({
        serverUuid,
        alloc_id: z.number().int().positive()
    }),

    pelican_client_server_allocations_unassign: z.object({
        serverUuid,
        alloc_id: z.number().int().positive()
    }),

    pelican_client_server_users_list: z.object({serverUuid}),

    pelican_client_server_users_create: z.object({
        serverUuid,
        email: z.string().email(),
        permissions: z.array(z.string())
    }),

    pelican_client_server_users_info: z.object({
        serverUuid,
        user_uuid: z.string()
    }),

    pelican_client_server_users_update: z.object({
        serverUuid,
        user_uuid: z.string(),
        permissions: z.array(z.string())
    }),

    pelican_client_server_users_delete: z.object({
        serverUuid,
        user_uuid: z.string()
    }),

    pelican_client_server_backups_list: z.object({
        serverUuid,
        page: z.number().int().positive().optional()
    }),

    pelican_client_server_backups_create: z.object({
        serverUuid,
        name: z.string().max(255).optional(),
        is_locked: z.boolean(),
        ignored_files: z.array(z.string())
    }),

    pelican_client_server_backups_info: z.object({
        serverUuid,
        backup_uuid: z.string()
    }),

    pelican_client_server_backups_downloadGetUrl: z.object({
        serverUuid,
        backup_uuid: z.string()
    }),

    pelican_client_server_backups_download: z.object({
        serverUuid,
        backup_uuid: z.string()
    }),

    pelican_client_server_backups_delete: z.object({
        serverUuid,
        backup_uuid: z.string()
    }),

    pelican_client_server_backups_rename: z.object({
        serverUuid,
        backup_uuid: z.string(),
        name: z.string()
    }),

    pelican_client_server_backups_toggleLock: z.object({
        serverUuid,
        backup_uuid: z.string()
    }),

    pelican_client_server_backups_restore: z.object({
        serverUuid,
        backup_uuid: z.string(),
        truncate: z.boolean()
    }),

    pelican_client_server_startup_list: z.object({serverUuid}),

    pelican_client_server_startup_set: z.object({
        serverUuid,
        key: z.string(),
        value: z.string()
    }),

    pelican_client_server_settings_rename: z.object({
        serverUuid,
        name: z.string().max(255)
    }),

    pelican_client_server_settings_updateDescription: z.object({
        serverUuid,
        description: z.string().nullable()
    }),

    pelican_client_server_settings_reinstall: z.object({serverUuid}),

    pelican_client_server_settings_changeDockerImage: z.object({
        serverUuid,
        image: z.string()
    })
} as const satisfies Record<string, z.ZodType>

export type ClientToolId = keyof typeof CLIENT_TOOL_SCHEMAS
