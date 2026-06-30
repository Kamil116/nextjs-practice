import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createIssue, updateIssue, deleteIssue } from './issues'
import { getCurrentUser } from '@/lib/dal'
import { updateTag } from 'next/cache'

const { mockInsert, mockUpdate, mockDelete, mockFindFirst } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockFindFirst: vi.fn(),
}))

vi.mock('@/lib/dal', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    insert: () => ({
      values: mockInsert,
    }),
    update: () => ({
      set: () => ({
        where: mockUpdate,
      }),
    }),
    delete: () => ({
      where: mockDelete,
    }),
    query: {
      issues: {
        findFirst: mockFindFirst,
      },
    },
  },
}))

vi.mock('@/lib/utils', () => ({
  mockDelay: vi.fn(),
}))

describe('issue server actions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed',
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue(undefined)
    mockUpdate.mockResolvedValue(undefined)
    mockDelete.mockResolvedValue(undefined)
  })

  it('createIssue rejects unauthenticated users', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const result = await createIssue({
      title: 'Test issue',
      status: 'todo',
      priority: 'medium',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('createIssue uses session user id', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const result = await createIssue({
      title: 'Test issue',
      status: 'todo',
      priority: 'medium',
    })

    expect(result.success).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith({
      title: 'Test issue',
      description: null,
      status: 'todo',
      priority: 'medium',
      userId: 'user-1',
    })
    expect(updateTag).toHaveBeenCalledWith('issues')
  })

  it('updateIssue rejects non-owners', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockFindFirst.mockResolvedValue(null)

    const result = await updateIssue(1, { title: 'Updated' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Forbidden')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updateIssue succeeds for owner', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockFindFirst.mockResolvedValue({
      id: 1,
      userId: 'user-1',
      title: 'Old',
      status: 'todo',
      priority: 'low',
    })

    const result = await updateIssue(1, { title: 'Updated title' })

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
    expect(updateTag).toHaveBeenCalledWith('issues')
  })

  it('deleteIssue rejects non-owners', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockFindFirst.mockResolvedValue(null)

    const result = await deleteIssue(1)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Forbidden')
    expect(mockDelete).not.toHaveBeenCalled()
  })
})
