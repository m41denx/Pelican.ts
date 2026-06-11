import {describe, expect, test} from "bun:test"
import type {PelicanAPIClient} from "@pelican.ts/sdk/api"
import {
    createPelicanClientTools,
    createPelicanServerTools
} from "./factory"

function createMockClient() {
    const serverUuid = "abc12345"
    const server = {
        info: async () => ({identifier: serverUuid}),
        resources: async () => ({}),
        command: async () => {},
        power: async () => {},
        activity: {list: async () => []},
        databases: {
            list: async () => [],
            create: async () => ({}),
            rotatePassword: async () => ({}),
            delete: async () => {}
        },
        files: {
            list: async () => [],
            contents: async () => "",
            downloadGetUrl: async () => "",
            download: async () => new ArrayBuffer(0),
            rename: async () => {},
            copy: async () => {},
            write: async () => {},
            compress: async () => ({}),
            decompress: async () => {},
            delete: async () => {},
            createFolder: async () => {},
            chmod: async () => {},
            pullFromRemote: async () => {},
            uploadGetUrl: async () => "",
            upload: async () => {}
        },
        schedules: {
            list: async () => [],
            create: async () => ({}),
            control: () => ({
                info: async () => ({}),
                update: async () => ({}),
                delete: async () => {},
                execute: async () => {},
                tasks: {
                    create: async () => ({}),
                    update: async () => ({}),
                    delete: async () => {}
                }
            })
        },
        allocations: {
            list: async () => [],
            autoAssign: async () => ({}),
            setNotes: async () => ({}),
            setPrimary: async () => ({}),
            unassign: async () => {}
        },
        users: {
            list: async () => [],
            create: async () => ({}),
            info: async () => ({}),
            update: async () => ({}),
            delete: async () => {}
        },
        backups: {
            list: async () => [],
            create: async () => ({}),
            info: async () => ({}),
            downloadGetUrl: async () => "",
            download: async () => new ArrayBuffer(0),
            delete: async () => {},
            rename: async () => {},
            toggleLock: async () => {},
            restore: async () => {}
        },
        startup: {list: async () => ({}), set: async () => ({})},
        settings: {
            rename: async () => {},
            updateDescription: async () => {},
            reinstall: async () => {},
            changeDockerImage: async () => {}
        }
    }

    return {
        listPermissions: async () => ({}),
        listServers: async () => [],
        account: {
            info: async () => ({}),
            updateEmail: async () => {},
            updatePassword: async () => {},
            apiKeys: {
                list: async () => [],
                create: async () => ({secret_token: "x"}),
                delete: async () => {}
            },
            sshKeys: {
                list: async () => [],
                create: async () => ({}),
                delete: async () => {}
            }
        },
        server: (uuid: string) => {
            if (uuid !== serverUuid) {
                throw new Error(`unexpected server uuid: ${uuid}`)
            }
            return server
        }
    } as unknown as PelicanAPIClient
}

describe("createPelicanClientTools", () => {
    test("includes root and server tools", () => {
        const tools = createPelicanClientTools(createMockClient())
        expect(tools.listServers).toBeDefined()
        expect(tools.server_info).toBeDefined()
        expect(Object.keys(tools).length).toBe(69)
    })

    test("exclude filter removes matching tools", () => {
        const tools = createPelicanClientTools(createMockClient(), {
            exclude: ["pelican_client_server_settings"]
        })
        expect(tools.server_settings_reinstall).toBeUndefined()
        expect(tools.listServers).toBeDefined()
    })
})

describe("createPelicanServerTools", () => {
    test("omits serverUuid from server_info input schema", () => {
        const tools = createPelicanServerTools(createMockClient(), "abc12345")
        expect(tools.server_info).toBeDefined()
        expect(tools.listServers).toBeUndefined()
    })

    test("execute passes bound server uuid", async () => {
        const tools = createPelicanServerTools(createMockClient(), "abc12345")
        const serverInfo = tools.server_info
        expect(serverInfo).toBeDefined()
        if (!serverInfo || !("execute" in serverInfo)) {
            throw new Error("server_info tool missing execute")
        }
        const result = await serverInfo.execute!(
            {include: undefined},
            {toolCallId: "1", messages: []}
        )
        expect(result).toEqual({identifier: "abc12345"})
    })
})
