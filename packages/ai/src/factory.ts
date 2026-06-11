import type {PelicanAPIClient} from "@pelican.ts/sdk/api"
import {tool, zodSchema, type ToolSet} from "ai"
import {z} from "zod"
import {formatPelicanToolError} from "./errors"
import {CLIENT_TOOL_BINDINGS} from "./generated/client-tools"
import {CLIENT_TOOL_SCHEMAS, type ClientToolId} from "./schemas"
import {serializeToolResult} from "./serialize"
import type {ToolScope} from "./types"

export type CreatePelicanToolsOptions = {
    /** Omit tools whose id matches any of these prefixes */
    exclude?: string[]
    /** Only include tools whose id starts with any of these prefixes */
    include?: string[]
    /** Pre-bind server context so server-scoped tool inputs omit serverUuid */
    serverUuid?: string
}

function matchesFilter(id: string, options?: CreatePelicanToolsOptions): boolean {
    if (options?.include?.length) {
        if (!options.include.some(prefix => id.startsWith(prefix))) {
            return false
        }
    }
    if (options?.exclude?.length) {
        if (options.exclude.some(prefix => id.startsWith(prefix))) {
            return false
        }
    }
    return true
}

function schemaForTool(
    id: ClientToolId,
    boundServerUuid?: string
): z.ZodType {
    const base = CLIENT_TOOL_SCHEMAS[id]
    if (!boundServerUuid) {
        return base
    }
    if (base instanceof z.ZodObject && "serverUuid" in base.shape) {
        const {serverUuid: _serverUuid, ...restShape} = base.shape
        return z.object(restShape)
    }
    return base
}

function prepareInput(
    id: ClientToolId,
    input: Record<string, unknown>,
    boundServerUuid?: string
): Record<string, unknown> {
    if (boundServerUuid) {
        return {...input, serverUuid: boundServerUuid}
    }
    return input
}

function toolKeyFromId(id: string): string {
    return id.replace(/^pelican_client_/, "")
}

function createToolsFromBindings(
    client: PelicanAPIClient,
    options: CreatePelicanToolsOptions | undefined,
    scopeFilter?: ToolScope | ToolScope[]
): ToolSet {
    const scopes = scopeFilter
        ? Array.isArray(scopeFilter)
            ? scopeFilter
            : [scopeFilter]
        : null
    const boundServerUuid = options?.serverUuid
    const tools: ToolSet = {}

    for (const binding of CLIENT_TOOL_BINDINGS) {
        if (!matchesFilter(binding.id, options)) {
            continue
        }
        if (scopes && !scopes.includes(binding.scope)) {
            continue
        }
        if (boundServerUuid && binding.scope === "root") {
            continue
        }

        const id = binding.id as ClientToolId
        const key = toolKeyFromId(binding.id)

        tools[key] = tool({
            description: binding.description,
            inputSchema: zodSchema(schemaForTool(id, boundServerUuid)),
            execute: async input => {
                try {
                    const prepared = prepareInput(
                        id,
                        input as Record<string, unknown>,
                        boundServerUuid
                    )
                    const result = await binding.invoke(client, prepared)
                    return serializeToolResult(result)
                } catch (error) {
                    throw formatPelicanToolError(error)
                }
            }
        })
    }

    return tools
}

/** All Client API tools (~69). Server-scoped tools require serverUuid in each call unless using createPelicanServerTools. */
export function createPelicanClientTools(
    client: PelicanAPIClient,
    options?: CreatePelicanToolsOptions
): ToolSet {
    return createToolsFromBindings(client, options)
}

/** Server- and schedule-scoped tools with serverUuid pre-bound. */
export function createPelicanServerTools(
    client: PelicanAPIClient,
    serverUuid: string,
    options?: Omit<CreatePelicanToolsOptions, "serverUuid">
): ToolSet {
    return createToolsFromBindings(client, {...options, serverUuid}, [
        "server",
        "schedule"
    ])
}

export {CLIENT_TOOL_BINDINGS, CLIENT_TOOL_IDS} from "./generated/client-tools"
export type {GeneratedClientToolId} from "./generated/client-tools"
