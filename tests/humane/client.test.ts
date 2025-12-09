import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Client } from '@/humane/Client'
import { Client as ClientT } from '@/api/client/client'

// Mock the API client
const mockApiClient = {
    account: {
        info: vi.fn(),
    },
    listPermissions: vi.fn(),
    listServers: vi.fn(),
    server: vi.fn(),
} as unknown as ClientT

describe('Client', () => {
    let client: Client

    beforeEach(() => {
        vi.clearAllMocks()
        client = new Client(mockApiClient)
    })

    it('should be instantiated correctly', () => {
        expect(client).toBeInstanceOf(Client)
        expect(client.$client).toBe(mockApiClient)
    })

    it('should get account info', async () => {
        const mockUser = { id: 1, email: 'test@example.com' }
        // @ts-ignore
        mockApiClient.account.info.mockResolvedValue(mockUser)

        const account = await client.getAccount()

        expect(mockApiClient.account.info).toHaveBeenCalled()
        expect(account).toBeDefined()
        // verify account properties if needed, e.g. account.email assuming Account wraps it
    })

    it('should list permissions', async () => {
        const mockPermissions = { 'admin.users': { description: 'test', keys: { create: 'Create' } } }
         // @ts-ignore
        mockApiClient.listPermissions.mockResolvedValue(mockPermissions)

        const permissions = await client.listPermissions()

        expect(mockApiClient.listPermissions).toHaveBeenCalled()
        expect(permissions).toBe(mockPermissions)
    })

    it('should list servers', async () => {
        const mockServers = [
            { uuid: 'server-1', name: 'Server 1', relationships: { allocations: { data: [] }, variables: { data: [] } } },
            { uuid: 'server-2', name: 'Server 2', relationships: { allocations: { data: [] }, variables: { data: [] } } },
        ]
         // @ts-ignore
        mockApiClient.listServers.mockResolvedValue(mockServers)
         // @ts-ignore
        mockApiClient.server.mockReturnValue({}) // Mock server method call inside constructor

        const servers = await client.listServers()

        expect(mockApiClient.listServers).toHaveBeenCalledWith("accessible", 1, 50, undefined)
        expect(servers).toHaveLength(2)
        expect(servers[0]!.uuid).toBe('server-1')
    })

    it('should get a server by uuid', async () => {
        const uuid = 'server-uuid'
        const mockServerData = { uuid, name: 'Test Server', relationships: { allocations: { data: [] }, variables: { data: [] } } }
        
        const mockServerInstance = {
            info: vi.fn().mockResolvedValue(mockServerData)
        }
         // @ts-ignore
        mockApiClient.server.mockReturnValue(mockServerInstance)

        const server = await client.getServer(uuid)

        expect(mockApiClient.server).toHaveBeenCalledWith(uuid)
        expect(mockServerInstance.info).toHaveBeenCalled()
        expect(server.uuid).toBe(uuid)
    })
})
