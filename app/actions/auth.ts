'use server'

import { z } from 'zod'
import {
  verifyPassword,
  createSession,
  createUser,
  deleteSession,
} from '@/lib/auth'
import { getUserByEmail } from '@/lib/dal'
import { mockDelay } from '@/lib/utils'
import { redirect } from 'next/navigation'

const SignInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const SignUpSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

async function ensureSession(userId: string): Promise<ActionResponse | null> {
  const sessionCreated = await createSession(userId)
  if (!sessionCreated) {
    return {
      success: false,
      message: 'Could not create session. Please try again.',
      error: 'Session creation failed',
    }
  }
  return null
}

export async function signIn(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const data = {
      email: (formData.get('email') as string) ?? '',
      password: (formData.get('password') as string) ?? '',
    }

    const validationResult = SignInSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validationResult.data
    let user
    try {
      user = await getUserByEmail(email)
    } catch {
      return {
        success: false,
        message: 'Something went wrong',
        error: 'Database error',
      }
    }
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      }
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password',
      }
    }

    const sessionError = await ensureSession(user.id)
    if (sessionError) return sessionError

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Something went wrong',
      error: 'Something went wrong',
    }
  }
}

export async function signUp(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const data = {
      email: (formData.get('email') as string) ?? '',
      password: (formData.get('password') as string) ?? '',
      confirmPassword: (formData.get('confirmPassword') as string) ?? '',
    }
    const validationResult = SignUpSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Email or password validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validationResult.data
    let existingUser
    try {
      existingUser = await getUserByEmail(email)
    } catch {
      return {
        success: false,
        message: 'Something went wrong',
        error: 'Database error',
      }
    }
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists',
        errors: {
          email: ['User with this email already exists'],
        },
      }
    }

    const user = await createUser(email, password)
    if (!user) {
      return {
        success: false,
        message: 'User already exists',
        errors: {
          email: ['User with this email already exists'],
        },
      }
    }

    const sessionError = await ensureSession(user.id)
    if (sessionError) return sessionError

    return {
      success: true,
      message: 'Account created successfully',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Something went wrong. Check DATABASE_URL and run npm run db:push.',
      error: 'Something went wrong',
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await mockDelay(300)
    await deleteSession()
  } catch (e) {
    console.error(e)
    throw new Error('Failed to sign out')
  } finally {
    redirect('/signin')
  }
}
