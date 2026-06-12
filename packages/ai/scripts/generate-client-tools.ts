import fs from "node:fs"
import path from "node:path"
import {Project, SyntaxKind} from "ts-morph"
import {CLIENT_TOOL_SCHEMAS} from "../src/schemas/client"

type ToolScope = "root" | "server" | "schedule"

type ToolSpec = {
    id: keyof typeof CLIENT_TOOL_SCHEMAS
    scope: ToolScope
    description: string
    invokeBody: string
}

const TOOL_SPECS: ToolSpec[] = [
    {
        id: "pelican_client_listPermissions",
        scope: "root",
        description: "List all client API permission keys and descriptions.",
        invokeBody: "return client.listPermissions()"
    },
    {
        id: "pelican_client_listServers",
        scope: "root",
        description: "List servers visible to the authenticated client.",
        invokeBody:
            "return client.listServers(input.type as never, input.page as number | undefined, input.per_page as number | undefined, input.include as never)"
    },
    {
        id: "pelican_client_account_info",
        scope: "root",
        description: "Get the authenticated account profile.",
        invokeBody: "return client.account.info()"
    },
    {
        id: "pelican_client_account_updateEmail",
        scope: "root",
        description: "Update the account email address.",
        invokeBody:
            "return client.account.updateEmail(input.newEmail as string, input.password as string)"
    },
    {
        id: "pelican_client_account_updatePassword",
        scope: "root",
        description: "Update the account password.",
        invokeBody:
            "return client.account.updatePassword(input.currentPassword as string, input.newPassword as string)"
    },
    {
        id: "pelican_client_account_apiKeys_list",
        scope: "root",
        description: "List API keys for the authenticated account.",
        invokeBody: "return client.account.apiKeys.list()"
    },
    {
        id: "pelican_client_account_apiKeys_create",
        scope: "root",
        description: "Create a new client API key.",
        invokeBody:
            "return client.account.apiKeys.create(input.description as string, input.allowed_ips as string[] | undefined)"
    },
    {
        id: "pelican_client_account_apiKeys_delete",
        scope: "root",
        description: "Delete a client API key by identifier.",
        invokeBody:
            "return client.account.apiKeys.delete(input.identifier as string)"
    },
    {
        id: "pelican_client_account_sshKeys_list",
        scope: "root",
        description: "List SSH keys for the authenticated account.",
        invokeBody: "return client.account.sshKeys.list()"
    },
    {
        id: "pelican_client_account_sshKeys_create",
        scope: "root",
        description: "Add an SSH public key to the account.",
        invokeBody:
            "return client.account.sshKeys.create(input.name as string, input.public_key as string)"
    },
    {
        id: "pelican_client_account_sshKeys_delete",
        scope: "root",
        description: "Remove an SSH key by fingerprint.",
        invokeBody:
            "return client.account.sshKeys.delete(input.fingerprint as string)"
    },
    {
        id: "pelican_client_server_info",
        scope: "server",
        description: "Get server details by identifier.",
        invokeBody:
            "return server(input).info(input.include as never)"
    },
    {
        id: "pelican_client_server_resources",
        scope: "server",
        description: "Get live resource usage stats for a server.",
        invokeBody: "return server(input).resources()"
    },
    {
        id: "pelican_client_server_command",
        scope: "server",
        description: "Send a console command to a running server.",
        invokeBody:
            "return server(input).command(input.command as string)"
    },
    {
        id: "pelican_client_server_power",
        scope: "server",
        description: "Change server power state (start, stop, restart, kill).",
        invokeBody: "return server(input).power(input.signal as never)"
    },
    {
        id: "pelican_client_server_activity_list",
        scope: "server",
        description: "List activity log entries for a server.",
        invokeBody:
            "return server(input).activity.list(input.page as number | undefined, input.per_page as number | undefined, { sortByTimestamp: input.sortByTimestamp as never, includeActor: input.includeActor as boolean | undefined })"
    },
    {
        id: "pelican_client_server_databases_list",
        scope: "server",
        description: "List databases for a server.",
        invokeBody:
            "return server(input).databases.list(input.include as never, input.page as number | undefined)"
    },
    {
        id: "pelican_client_server_databases_create",
        scope: "server",
        description: "Create a database on a server.",
        invokeBody:
            "return server(input).databases.create(input.database as string, input.remote as string)"
    },
    {
        id: "pelican_client_server_databases_rotatePassword",
        scope: "server",
        description: "Rotate the password for a server database.",
        invokeBody:
            "return server(input).databases.rotatePassword(input.database_id as string)"
    },
    {
        id: "pelican_client_server_databases_delete",
        scope: "server",
        description: "Delete a server database.",
        invokeBody:
            "return server(input).databases.delete(input.database_id as string)"
    },
    {
        id: "pelican_client_server_files_list",
        scope: "server",
        description: "List files in a server directory.",
        invokeBody:
            "return server(input).files.list(input.path as string | undefined)"
    },
    {
        id: "pelican_client_server_files_contents",
        scope: "server",
        description: "Read text file contents from a server.",
        invokeBody: "return server(input).files.contents(input.path as string)"
    },
    {
        id: "pelican_client_server_files_downloadGetUrl",
        scope: "server",
        description: "Get a signed download URL for a server file.",
        invokeBody:
            "return server(input).files.downloadGetUrl(input.path as string)"
    },
    {
        id: "pelican_client_server_files_download",
        scope: "server",
        description:
            "Download a server file (returns base64-encoded bytes in the tool result).",
        invokeBody: "return server(input).files.download(input.path as string)"
    },
    {
        id: "pelican_client_server_files_rename",
        scope: "server",
        description: "Rename one or more files on a server.",
        invokeBody:
            "return server(input).files.rename(input.root as string | undefined, input.files as { from: string; to: string }[])"
    },
    {
        id: "pelican_client_server_files_copy",
        scope: "server",
        description: "Copy files on a server.",
        invokeBody:
            "return server(input).files.copy(input.location as string)"
    },
    {
        id: "pelican_client_server_files_write",
        scope: "server",
        description: "Write text content to a server file.",
        invokeBody:
            "return server(input).files.write(input.path as string, input.content as string)"
    },
    {
        id: "pelican_client_server_files_compress",
        scope: "server",
        description: "Compress files on a server into an archive.",
        invokeBody:
            "return server(input).files.compress(input.root as string | undefined, input.files as string[], input.archive_name as string | undefined, input.extension as never)"
    },
    {
        id: "pelican_client_server_files_decompress",
        scope: "server",
        description: "Decompress an archive on a server.",
        invokeBody:
            "return server(input).files.decompress(input.root as string | undefined, input.file as string)"
    },
    {
        id: "pelican_client_server_files_delete",
        scope: "server",
        description: "Delete files on a server.",
        invokeBody:
            "return server(input).files.delete(input.root as string | undefined, input.files as string[])"
    },
    {
        id: "pelican_client_server_files_createFolder",
        scope: "server",
        description: "Create a folder on a server.",
        invokeBody:
            "return server(input).files.createFolder(input.root as string | undefined, input.name as string)"
    },
    {
        id: "pelican_client_server_files_chmod",
        scope: "server",
        description: "Change file permissions on a server.",
        invokeBody:
            "return server(input).files.chmod(input.root as string | undefined, input.files as { file: string; mode: number }[])"
    },
    {
        id: "pelican_client_server_files_pullFromRemote",
        scope: "server",
        description: "Pull a file from a remote URL into the server.",
        invokeBody:
            "return server(input).files.pullFromRemote(input.url as string, input.directory as string | undefined, input.filename as string | undefined, input.use_header as boolean | undefined, input.foreground as boolean | undefined)"
    },
    {
        id: "pelican_client_server_files_uploadGetUrl",
        scope: "server",
        description: "Get a signed upload URL for server files.",
        invokeBody: "return server(input).files.uploadGetUrl()"
    },
    {
        id: "pelican_client_server_files_upload",
        scope: "server",
        description:
            "Upload a file to the server from base64-encoded content.",
        invokeBody: `{
            const file = base64ToFile(input.contentBase64 as string, input.filename as string)
            return server(input).files.upload(file, input.root as string | undefined)
        }`
    },
    {
        id: "pelican_client_server_schedules_list",
        scope: "server",
        description: "List schedules for a server.",
        invokeBody: "return server(input).schedules.list()"
    },
    {
        id: "pelican_client_server_schedules_create",
        scope: "server",
        description: "Create a schedule on a server.",
        invokeBody:
            "return server(input).schedules.create(input.params as never)"
    },
    {
        id: "pelican_client_server_schedules_control_info",
        scope: "schedule",
        description: "Get details for a server schedule.",
        invokeBody:
            "return schedule(input).info()"
    },
    {
        id: "pelican_client_server_schedules_control_update",
        scope: "schedule",
        description: "Update a server schedule.",
        invokeBody:
            "return schedule(input).update(input.params as never)"
    },
    {
        id: "pelican_client_server_schedules_control_delete",
        scope: "schedule",
        description: "Delete a server schedule.",
        invokeBody: "return schedule(input).delete()"
    },
    {
        id: "pelican_client_server_schedules_control_execute",
        scope: "schedule",
        description: "Execute a server schedule immediately.",
        invokeBody: "return schedule(input).execute()"
    },
    {
        id: "pelican_client_server_schedules_tasks_create",
        scope: "schedule",
        description: "Create a task on a server schedule.",
        invokeBody:
            "return schedule(input).tasks.create(input.opts as never)"
    },
    {
        id: "pelican_client_server_schedules_tasks_update",
        scope: "schedule",
        description: "Update a task on a server schedule.",
        invokeBody:
            "return schedule(input).tasks.update(input.task_id as number, input.opts as never)"
    },
    {
        id: "pelican_client_server_schedules_tasks_delete",
        scope: "schedule",
        description: "Delete a task from a server schedule.",
        invokeBody:
            "return schedule(input).tasks.delete(input.task_id as number)"
    },
    {
        id: "pelican_client_server_allocations_list",
        scope: "server",
        description: "List network allocations for a server.",
        invokeBody: "return server(input).allocations.list()"
    },
    {
        id: "pelican_client_server_allocations_autoAssign",
        scope: "server",
        description: "Auto-assign a new allocation to a server.",
        invokeBody: "return server(input).allocations.autoAssign()"
    },
    {
        id: "pelican_client_server_allocations_setNotes",
        scope: "server",
        description: "Set notes on a server allocation.",
        invokeBody:
            "return server(input).allocations.setNotes(input.alloc_id as number, input.notes as string)"
    },
    {
        id: "pelican_client_server_allocations_setPrimary",
        scope: "server",
        description: "Set the primary allocation for a server.",
        invokeBody:
            "return server(input).allocations.setPrimary(input.alloc_id as number)"
    },
    {
        id: "pelican_client_server_allocations_unassign",
        scope: "server",
        description: "Unassign an allocation from a server.",
        invokeBody:
            "return server(input).allocations.unassign(input.alloc_id as number)"
    },
    {
        id: "pelican_client_server_users_list",
        scope: "server",
        description: "List subusers for a server.",
        invokeBody: "return server(input).users.list()"
    },
    {
        id: "pelican_client_server_users_create",
        scope: "server",
        description: "Add a subuser to a server.",
        invokeBody:
            "return server(input).users.create(input.email as string, input.permissions as string[])"
    },
    {
        id: "pelican_client_server_users_info",
        scope: "server",
        description: "Get a server subuser by UUID.",
        invokeBody:
            "return server(input).users.info(input.user_uuid as string)"
    },
    {
        id: "pelican_client_server_users_update",
        scope: "server",
        description: "Update subuser permissions on a server.",
        invokeBody:
            "return server(input).users.update(input.user_uuid as string, input.permissions as string[])"
    },
    {
        id: "pelican_client_server_users_delete",
        scope: "server",
        description: "Remove a subuser from a server.",
        invokeBody:
            "return server(input).users.delete(input.user_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_list",
        scope: "server",
        description: "List backups for a server.",
        invokeBody:
            "return server(input).backups.list(input.page as number | undefined)"
    },
    {
        id: "pelican_client_server_backups_create",
        scope: "server",
        description: "Create a server backup.",
        invokeBody:
            "return server(input).backups.create({ name: input.name as string | undefined, is_locked: input.is_locked as boolean, ignored_files: input.ignored_files as string[] })"
    },
    {
        id: "pelican_client_server_backups_info",
        scope: "server",
        description: "Get backup details for a server.",
        invokeBody:
            "return server(input).backups.info(input.backup_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_downloadGetUrl",
        scope: "server",
        description: "Get a signed download URL for a server backup.",
        invokeBody:
            "return server(input).backups.downloadGetUrl(input.backup_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_download",
        scope: "server",
        description:
            "Download a server backup (returns base64-encoded bytes in the tool result).",
        invokeBody:
            "return server(input).backups.download(input.backup_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_delete",
        scope: "server",
        description: "Delete a server backup.",
        invokeBody:
            "return server(input).backups.delete(input.backup_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_rename",
        scope: "server",
        description: "Rename a server backup.",
        invokeBody:
            "return server(input).backups.rename(input.backup_uuid as string, input.name as string)"
    },
    {
        id: "pelican_client_server_backups_toggleLock",
        scope: "server",
        description: "Toggle lock state on a server backup.",
        invokeBody:
            "return server(input).backups.toggleLock(input.backup_uuid as string)"
    },
    {
        id: "pelican_client_server_backups_restore",
        scope: "server",
        description: "Restore a server from a backup.",
        invokeBody:
            "return server(input).backups.restore(input.backup_uuid as string, input.truncate as boolean)"
    },
    {
        id: "pelican_client_server_startup_list",
        scope: "server",
        description: "List startup variables for a server.",
        invokeBody: "return server(input).startup.list()"
    },
    {
        id: "pelican_client_server_startup_set",
        scope: "server",
        description: "Set a startup variable value on a server.",
        invokeBody:
            "return server(input).startup.set(input.key as string, input.value as string)"
    },
    {
        id: "pelican_client_server_settings_rename",
        scope: "server",
        description: "Rename a server.",
        invokeBody: "return server(input).settings.rename(input.name as string)"
    },
    {
        id: "pelican_client_server_settings_updateDescription",
        scope: "server",
        description: "Update the server description.",
        invokeBody:
            "return server(input).settings.updateDescription(input.description as string | null)"
    },
    {
        id: "pelican_client_server_settings_reinstall",
        scope: "server",
        description: "Trigger a server reinstall.",
        invokeBody: "return server(input).settings.reinstall()"
    },
    {
        id: "pelican_client_server_settings_changeDockerImage",
        scope: "server",
        description: "Change the Docker image used by a server.",
        invokeBody:
            "return server(input).settings.changeDockerImage(input.image as string)"
    }
]

const sdkClientRoot = path.resolve(__dirname, "../../../src/api/client")

function discoverAsyncMethods(): Set<string> {
    const project = new Project({
        tsConfigFilePath: path.resolve(__dirname, "../../../tsconfig.json"),
        skipAddingFilesFromTsConfig: true
    })

    project.addSourceFilesAtPaths(path.join(sdkClientRoot, "**/*.ts"))

    const discovered = new Set<string>()

    for (const sourceFile of project.getSourceFiles()) {
        if (sourceFile.getFilePath().includes("/types/")) {
            continue
        }

        for (const cls of sourceFile.getClasses()) {
            const className = cls.getName() ?? "anonymous"
            collectClassMethods(cls, className, discovered, [])
        }
    }

    return discovered
}

function collectClassMethods(
    cls: import("ts-morph").ClassDeclaration,
    className: string,
    discovered: Set<string>,
    pathPrefix: string[]
) {
    for (const member of cls.getMembers()) {
        if (member.getKind() !== SyntaxKind.PropertyDeclaration) {
            continue
        }

        const prop = member.asKindOrThrow(SyntaxKind.PropertyDeclaration)
        const name = prop.getName()
        if (!name || name.startsWith("_")) {
            continue
        }

        const initializer = prop.getInitializer()
        if (!initializer) {
            continue
        }

        if (initializer.getKind() === SyntaxKind.ArrowFunction) {
            const arrow = initializer.asKindOrThrow(SyntaxKind.ArrowFunction)
            if (arrow.isAsync()) {
                discovered.add([...pathPrefix, className, name].join("."))
            }
            continue
        }

        if (initializer.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const obj = initializer.asKindOrThrow(
                SyntaxKind.ObjectLiteralExpression
            )
            for (const propAssignment of obj.getProperties()) {
                if (propAssignment.getKind() !== SyntaxKind.MethodDeclaration) {
                    continue
                }
                const method = propAssignment.asKindOrThrow(
                    SyntaxKind.MethodDeclaration
                )
                if (!method.isAsync()) {
                    continue
                }
                const methodName = method.getName()
                if (!methodName) {
                    continue
                }
                discovered.add(
                    [...pathPrefix, className, name, methodName].join(".")
                )
            }
        }
    }
}

function validateSchemas() {
    const schemaIds = new Set(Object.keys(CLIENT_TOOL_SCHEMAS))
    const specIds = new Set(TOOL_SPECS.map(s => s.id))

    const missingSchemas = [...specIds].filter(id => !schemaIds.has(id))
    if (missingSchemas.length > 0) {
        throw new Error(
            `Missing schemas for tools:\n${missingSchemas.join("\n")}`
        )
    }

    const orphanSchemas = [...schemaIds].filter(id => !specIds.has(id))
    if (orphanSchemas.length > 0) {
        throw new Error(
            `Schemas without tool specs:\n${orphanSchemas.join("\n")}`
        )
    }
}

function emitInvokeHelpers(scope: ToolScope): string {
    const lines: string[] = []
    if (scope === "server") {
        lines.push(
            "            const server = (inp: Record<string, unknown>) =>",
            "                client.server(inp.serverUuid as string)"
        )
    }
    if (scope === "schedule") {
        lines.push(
            "            const schedule = (inp: Record<string, unknown>) =>",
            "                client",
            "                    .server(inp.serverUuid as string)",
            "                    .schedules.control(inp.scheduleId as number)"
        )
    }
    return lines.length > 0 ? `${lines.join("\n")}\n` : ""
}

function emitGeneratedFile() {
    const bindings = TOOL_SPECS.map(spec => {
        const invokeLines = spec.invokeBody.includes("\n")
            ? spec.invokeBody
            : `            ${spec.invokeBody}`
        const helpers = emitInvokeHelpers(spec.scope)

        return `    {
        id: "${spec.id}",
        description: ${JSON.stringify(spec.description)},
        scope: "${spec.scope}",
        invoke: async (client, input) => {
${helpers}${invokeLines.startsWith("            ") ? invokeLines : `            ${invokeLines}`}
        }
    }`
    }).join(",\n")

    const content = `/* eslint-disable */
// Auto-generated by scripts/generate-client-tools.ts — do not edit manually.

import type {PelicanAPIClient} from "@pelican.ts/sdk/api"
import {base64ToFile} from "../serialize"
import type {ToolBinding} from "../types"

export const CLIENT_TOOL_BINDINGS: ToolBinding[] = [
${bindings}
]

export const CLIENT_TOOL_IDS = [
${TOOL_SPECS.map(s => `    "${s.id}"`).join(",\n")}
] as const

export type GeneratedClientToolId = (typeof CLIENT_TOOL_IDS)[number]
`

    const outPath = path.resolve(
        __dirname,
        "../src/generated/client-tools.ts"
    )
    fs.mkdirSync(path.dirname(outPath), {recursive: true})
    fs.writeFileSync(outPath, content)
}

function main() {
    validateSchemas()

    const discovered = discoverAsyncMethods()
    const expectedMin = 60
    if (discovered.size < expectedMin) {
        console.warn(
            `Warning: ts-morph discovered only ${discovered.size} async methods (expected >= ${expectedMin})`
        )
        console.warn([...discovered].sort().join("\n"))
    }

    if (TOOL_SPECS.length !== Object.keys(CLIENT_TOOL_SCHEMAS).length) {
        throw new Error(
            `Tool spec count (${TOOL_SPECS.length}) does not match schema count (${Object.keys(CLIENT_TOOL_SCHEMAS).length})`
        )
    }

    emitGeneratedFile()
    console.log(`Generated ${TOOL_SPECS.length} client tool bindings.`)
}

main()
