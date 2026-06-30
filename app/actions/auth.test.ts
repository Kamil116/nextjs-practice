import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn } from './auth'
import { getUserByEmail } from '@/lib/dal'
import { verifyPassword, createSession } from '@/lib/auth'

vi.mock('@/lib/dal', () => ({
  getUserByEmail: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  createUser: vi.fn(),
  deleteSession: vi.fn(),
}))

const initialState = { success: false, message: '', errors: undefined }

describe('auth server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signIn returns validation errors for invalid email', async () => {
    const formData = new FormData()
    formData.set('email', 'not-an-email')
    formData.set('password', 'password123')

    const result = await signIn(initialState, formData)

    expect(result.success).toBe(false)
    expect(result.errors?.email).toBeDefined()
  })

  it('signIn rejects unknown user', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(undefined)

    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'password123')

    const result = await signIn(initialState, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Invalid email or password')
  })

  it('signIn creates session for valid credentials', async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed',
      createdAt: new Date(),
    })
    vi.mocked(verifyPassword).mockResolvedValue(true)
    vi.mocked(createSession).mockResolvedValue(true)

    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'password123')

    const result = await signIn(initialState, formData)

    expect(result.success).toBe(true)
    expect(createSession).toHaveBeenCalledWith('user-1')
  })
})
