import type {PelicanAPIClient} from "@pelican.ts/sdk/api"
import type {z} from "zod"

export type ToolScope = "root" | "server" | "schedule"

export type ToolBinding = {
    id: string
    description: string
    scope: ToolScope
    /** Returns JSON-serializable data or void (factory normalizes void to {ok: true}) */
    invoke: (
        client: PelicanAPIClient,
        input: Record<string, unknown>
    ) => Promise<unknown>
}

export type ClientToolSchemas = Record<string, z.ZodType>
