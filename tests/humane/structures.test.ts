import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServerSchedule, ServerScheduleTask } from '@/humane/ServerSchedule'
import { ServerDatabase } from '@/humane/ServerDatabase'
import { ServerAllocation } from '@/humane/ServerAllocation'
import { ServerUser } from '@/humane/ServerUser'
import { ServerClient } from '@/api/client/server'

const mockServerClient = {
    schedules: { control: vi.fn().mockReturnValue({ update: vi.fn(), delete: vi.fn(), execute: vi.fn(), tasks: { delete: vi.fn(), update: vi.fn() } }) },
    databases: { rotatePassword: vi.fn(), delete: vi.fn() },
    allocations: { setNotes: vi.fn(), setPrimary: vi.fn(), unassign: vi.fn() },
    users: { update: vi.fn(), delete: vi.fn() },
} as unknown as ServerClient

describe('ServerSchedule', () => {
    let schedule: ServerSchedule

    beforeEach(() => {
        vi.clearAllMocks()
        const mockData = {
            id: 1, created_at: new Date(), updated_at: new Date(), name: 'test', cron: {}, is_active: true, is_processing: false, last_run_at: null, next_run_at: new Date(), only_when_online: true, relationships: { tasks: { data: [] } }
        }
        // @ts-ignore
        schedule = new ServerSchedule(mockServerClient, mockData)
    })

    it('should update schedule', async () => {
        // @ts-ignore
        mockServerClient.schedules.control().update.mockResolvedValue({ ...schedule, name: 'updated' })
        // @ts-ignore
        await schedule.update({ name: 'updated' })
        expect(mockServerClient.schedules.control).toHaveBeenCalledWith(1)
        expect(schedule.name).toBe('updated')
    })

    it('should delete schedule', async () => {
        await schedule.delete()
        expect(mockServerClient.schedules.control).toHaveBeenCalledWith(1)
    })

    it('should execute schedule', async () => {
        await schedule.execute()
        expect(mockServerClient.schedules.control).toHaveBeenCalledWith(1)
    })
})

describe('ServerScheduleTask', () => {
    let task: ServerScheduleTask

    beforeEach(() => {
        const mockTaskData = {
            id: 10, action: 'command', continue_on_failure: false, created_at: new Date(), is_queued: false, payload: 'cmd', sequence_id: 1, time_offset: 0, updated_at: null
        }
        // @ts-ignore
        task = new ServerScheduleTask(mockServerClient, 1, mockTaskData)
    })

    it('should delete task', async () => {
        await task.delete()
        expect(mockServerClient.schedules.control).toHaveBeenCalledWith(1)
    })

    it('should update task', async () => {
         // @ts-ignore
        mockServerClient.schedules.control().tasks.update.mockResolvedValue({ action: 'power' })
        // @ts-ignore
        await task.update({ action: 'power' })
        expect(task.action).toBe('power')
    })
})

describe('ServerDatabase', () => {
    let db: ServerDatabase

    beforeEach(() => {
        const mockDbData = {
            id: 'db1', connections_from: '%', host: { address: '1.2.3.4', port: 1 }, max_connections: 1, name: 'db', username: 'u', relationships: { password: { attributes: { password: 'pass' } } }
        }
        // @ts-ignore
        db = new ServerDatabase(mockServerClient, mockDbData)
    })

    it('should rotate password', async () => {
        // @ts-ignore
        mockServerClient.databases.rotatePassword.mockResolvedValue({ relationships: { password: { attributes: { password: 'newpass' } } } })
        await db.rotatePassword()
        expect(mockServerClient.databases.rotatePassword).toHaveBeenCalledWith('db1')
        expect(db.password).toBe('newpass')
    })

    it('should delete database', async () => {
        await db.delete()
        expect(mockServerClient.databases.delete).toHaveBeenCalledWith('db1')
    })
})

describe('ServerAllocation', () => {
    let alloc: ServerAllocation

    beforeEach(() => {
        const mockAllocData = { id: 1, ip: '1.2.3.4', ip_alias: null, port: 1, notes: null, is_default: false }
        // @ts-ignore
        alloc = new ServerAllocation(mockServerClient, mockAllocData)
    })

    it('should set notes', async () => {
        // @ts-ignore
        mockServerClient.allocations.setNotes.mockResolvedValue({ notes: 'new notes' })
        await alloc.setNotes('new notes')
        expect(mockServerClient.allocations.setNotes).toHaveBeenCalledWith(1, 'new notes')
        expect(alloc.notes).toBe('new notes')
    })

    it('should make default', async () => {
        // @ts-ignore
        mockServerClient.allocations.setPrimary.mockResolvedValue({ is_default: true })
        await alloc.makeDefault()
        expect(mockServerClient.allocations.setPrimary).toHaveBeenCalledWith(1)
        expect(alloc.isDefault).toBe(true)
    })

    it('should unassign', async () => {
        await alloc.unassign()
        expect(mockServerClient.allocations.unassign).toHaveBeenCalledWith(1)
    })
})

describe('ServerUser', () => {
    let user: ServerUser

    beforeEach(() => {
        const mockUserData = { uuid: 'u1', email: 'e', image: 'i', "2fa_enabled": false, created_at: new Date(), permissions: [] }
        // @ts-ignore
        user = new ServerUser(mockServerClient, mockUserData)
    })

    it('should update permissions', async () => {
        // @ts-ignore
        mockServerClient.users.update.mockResolvedValue({ permissions: ['a'] })
        // @ts-ignore
        await user.update(['a'])
        expect(mockServerClient.users.update).toHaveBeenCalledWith('u1', ['a'])
        expect(user.permissions).toEqual(['a'])
    })

    it('should delete user', async () => {
        await user.delete()
        expect(mockServerClient.users.delete).toHaveBeenCalledWith('u1')
    })
})
