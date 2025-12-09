import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Server } from '@/humane/Server'
import { ServerClient } from '@/api/client/server'

const mockServerClient = {
    settings: {
        rename: vi.fn(),
        updateDescription: vi.fn(),
        reinstall: vi.fn(),
        changeDockerImage: vi.fn(),
    },
    activity: { list: vi.fn() },
    websocket: vi.fn(),
    resources: vi.fn(),
    command: vi.fn(),
    power: vi.fn(),
    databases: { list: vi.fn(), create: vi.fn() },
    schedules: { list: vi.fn(), create: vi.fn() },
    backups: { list: vi.fn(), create: vi.fn() },
    allocations: { list: vi.fn(), autoAssign: vi.fn() },
    files: { list: vi.fn(), createFolder: vi.fn(), upload: vi.fn(), uploadGetUrl: vi.fn(), pullFromRemote: vi.fn(), compress: vi.fn(), rename: vi.fn(), delete: vi.fn() },
    users: { list: vi.fn(), create: vi.fn() },
    startup: { list: vi.fn(), set: vi.fn() },
} as unknown as ServerClient

const mockServerData = {
    server_owner: true,
    identifier: 'server-id',
    internal_id: 1,
    uuid: 'server-uuid',
    name: 'Test Server',
    node: 'node-1',
    is_node_under_maintenance: false,
    sftp_details: { ip: '1.2.3.4', alias: null, port: 2022 },
    description: 'A test server',
    limits: {},
    invocation: '',
    docker_image: 'image/test',
    egg_features: [],
    feature_limits: {},
    status: 'running',
    is_suspended: false,
    is_installing: false,
    is_transferring: false,
    relationships: {
        allocations: { data: [] },
        variables: { data: [] },
        egg: { attributes: { uuid: 'egg-uuid', name: 'Egg' } },
        subusers: { data: [] }
    }
}

describe('Server', () => {
    let server: Server

    beforeEach(() => {
        vi.clearAllMocks()
        // @ts-ignore
        server = new Server(mockServerClient, mockServerData)
    })

    it('should be instantiated correctly', () => {
        expect(server).toBeInstanceOf(Server)
        expect(server.name).toBe('Test Server')
    })

    it('should rename server', async () => {
        const newName = 'New Name'
        await server.rename(newName)
        expect(mockServerClient.settings.rename).toHaveBeenCalledWith(newName)
        expect(server.name).toBe(newName)
    })

    it('should update description', async () => {
        const desc = 'New Desc'
        await server.updateDescription(desc)
        expect(mockServerClient.settings.updateDescription).toHaveBeenCalledWith(desc)
        expect(server.description).toBe(desc)
    })

    it('should reinstall server', async () => {
        await server.reinstall()
        expect(mockServerClient.settings.reinstall).toHaveBeenCalled()
    })

    it('should change docker image', async () => {
        const image = 'new/image'
        await server.changeDockerImage(image)
        expect(mockServerClient.settings.changeDockerImage).toHaveBeenCalledWith(image)
        expect(server.dockerImage).toBe(image)
    })

    it('should get activity logs', async () => {
        // @ts-ignore
        mockServerClient.activity.list.mockResolvedValue([])
        await server.getActivityLogs()
        expect(mockServerClient.activity.list).toHaveBeenCalledWith(1, 50)
    })

    it('should get websocket', () => {
        server.websocket()
        expect(mockServerClient.websocket).toHaveBeenCalledWith(false)
    })

    it('should get server stats', async () => {
        // @ts-ignore
        mockServerClient.resources.mockResolvedValue({})
        await server.getServerStats()
        expect(mockServerClient.resources).toHaveBeenCalled()
    })

    it('should run command', async () => {
        const cmd = 'say hell0'
        await server.runCommand(cmd)
        expect(mockServerClient.command).toHaveBeenCalledWith(cmd)
    })

    it('should send power signal', async () => {
        await server.sendPowerSignal('restart')
        expect(mockServerClient.power).toHaveBeenCalledWith('restart')
    })

    it('should get databases', async () => {
        // @ts-ignore
        mockServerClient.databases.list.mockResolvedValue([{
            id: 'db-1',
            connections_from: '%',
            host: { address: '1.2.3.4', port: 3306 },
            max_connections: 10,
            name: 'db_test',
            username: 'user',
            relationships: { password: { attributes: { password: 'pass' } } }
        }])
        await server.getDatabases()
        expect(mockServerClient.databases.list).toHaveBeenCalledWith([], 1)
    })

    it('should create database', async () => {
         // @ts-ignore
        mockServerClient.databases.create.mockResolvedValue({
            id: 'db-1',
            connections_from: '%',
            host: { address: '1.2.3.4', port: 3306 },
            max_connections: 10,
            name: 'db_test',
            username: 'user',
            relationships: { password: { attributes: { password: 'pass' } } }
        })
        await server.createDatabase('db', '%')
        expect(mockServerClient.databases.create).toHaveBeenCalledWith('db', '%')
    })
    
     it('should get schedules', async () => {
        // @ts-ignore
        mockServerClient.schedules.list.mockResolvedValue([{
            id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            name: 'Schedule',
            cron: { day_of_week: '*', day_of_month: '*', hour: '*', minute: '*' },
            is_active: true,
            is_processing: false,
            last_run_at: null,
            next_run_at: new Date(),
            only_when_online: true,
            relationships: { tasks: { data: [] } }
        }])
        await server.getSchedules()
        expect(mockServerClient.schedules.list).toHaveBeenCalled()
    })

    it('should create schedule', async () => {
         // @ts-ignore
        mockServerClient.schedules.create.mockResolvedValue({
            id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            name: 'Schedule',
            cron: { day_of_week: '*', day_of_month: '*', hour: '*', minute: '*' },
            is_active: true,
            is_processing: false,
            last_run_at: null,
            next_run_at: new Date(),
            only_when_online: true,
            relationships: { tasks: { data: [] } }
        })
        await server.createSchedule({
            name: 'Schedule',
            minute: '*',
            hour: '*',
            day_of_month: '*',
            month: '*',
            day_of_week: '*',
            is_active: true,
            only_when_online: true
        })
        expect(mockServerClient.schedules.create).toHaveBeenCalled()
    })

    it('should get backups', async () => {
        // @ts-ignore
        mockServerClient.backups.list.mockResolvedValue([{
             uuid: 'backup-1',
             name: 'backup',
             ignored_files: [],
             sha256_hash: 'hash',
             bytes: 100,
             created_at: new Date(),
             completed_at: new Date(),
             is_successful: true,
             is_locked: false
        }])
        await server.getBackups()
        expect(mockServerClient.backups.list).toHaveBeenCalledWith(1)
    })

    it('should create backup', async () => {
         // @ts-ignore
        mockServerClient.backups.create.mockResolvedValue({
             uuid: 'backup-1',
             name: 'backup',
             ignored_files: [],
             sha256_hash: 'hash',
             bytes: 100,
             created_at: new Date(),
             completed_at: new Date(),
             is_successful: true,
             is_locked: false
        })
        const options = {
            name: 'backup',
            is_locked: false,
            ignored_files: []
        }
        await server.createBackup(options)
        expect(mockServerClient.backups.create).toHaveBeenCalledWith(options)
    })

    it('should get allocations', async () => {
        // @ts-ignore
        mockServerClient.allocations.list.mockResolvedValue([{
            id: 1,
            ip: '1.2.3.4',
            ip_alias: null,
            port: 25565,
            notes: null,
            is_default: true
        }])
        await server.getAllocations()
        expect(mockServerClient.allocations.list).toHaveBeenCalled()
    })

    it('should create allocation', async () => {
         // @ts-ignore
        mockServerClient.allocations.autoAssign.mockResolvedValue({
            id: 1,
            ip: '1.2.3.4',
            ip_alias: null,
            port: 25565,
            notes: null,
            is_default: true
        })
        await server.createAllocation()
        expect(mockServerClient.allocations.autoAssign).toHaveBeenCalled()
    })

    it('should get files', async () => {
        // @ts-ignore
        mockServerClient.files.list.mockResolvedValue([])
        await server.getFiles('/')
        expect(mockServerClient.files.list).toHaveBeenCalledWith('/')
    })

    it('should perform file operations', async () => {
        await server.createFolder('/', 'pavel')
        expect(mockServerClient.files.createFolder).toHaveBeenCalled()
        
        // br-br patapim

        const validFile = new File([''], 'test.txt', { type: 'text/plain' })
        await server.uploadFile(validFile, '/')
        expect(mockServerClient.files.upload).toHaveBeenCalledWith(validFile, '/')

        await server.uploadFileGetUrl()
        expect(mockServerClient.files.uploadGetUrl).toHaveBeenCalled()

        await server.pullFileFromRemote('/', 'url')
        expect(mockServerClient.files.pullFromRemote).toHaveBeenCalled()

        await server.compressMultipleFiles('/', [])
        expect(mockServerClient.files.compress).toHaveBeenCalled()

        await server.renameMultipleFiles('/', [])
        expect(mockServerClient.files.rename).toHaveBeenCalled()

        await server.deleteMultipleFiles('/', [])
        expect(mockServerClient.files.delete).toHaveBeenCalled()
    })

    it('should get users', async () => {
        // @ts-ignore
        mockServerClient.users.list.mockResolvedValue([])
        await server.getUsers()
        expect(mockServerClient.users.list).toHaveBeenCalled()
    })

    it('should create user', async () => {
         // @ts-ignore
        mockServerClient.users.create.mockResolvedValue({})
        await server.createUser('email', [])
        expect(mockServerClient.users.create).toHaveBeenCalled()
    })

    it('should get startup info', async () => {
         // @ts-ignore
        mockServerClient.startup.list.mockResolvedValue([])
        await server.getStartupInfo()
        expect(mockServerClient.startup.list).toHaveBeenCalled()
    })

    it('should set startup variable', async () => {
        await server.setStartupVariable('key', 'val')
        expect(mockServerClient.startup.set).toHaveBeenCalledWith('key', 'val')
    })
})
