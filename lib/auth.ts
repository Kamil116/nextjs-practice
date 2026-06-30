import { compare, hash } from 'bcrypt'
import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'
import { db } from '@/db'
import { users } from '@/db/schema'
import { cache } from 'react'
import {
  generateJWT,
  shouldRefreshToken,
  verifyJWT,
} from '@/lib/jwt'

// Hash a password
export async function hashPassword(password: string) {
  return hash(password, 10)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

// Create a new user
export async function createUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password)
  const id = nanoid()

  try {
    await db.insert(users).values({
      id,
      email,
      password: hashedPassword,
    })

    return { id, email }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Create a session using JWT
export async function createSession(userId: string) {
  try {
    // Create JWT with user data
    const token = await generateJWT({ userId })

    // Store JWT in a cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    })

    return true
  } catch (error) {
    console.error('Error creating session:', error)
    return false
  }
}

// Get current session from JWT
export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) return null
    const payload = await verifyJWT(token)

    return payload ? { userId: payload.userId } : null
  } catch (error) {
    // Handle the specific prerendering error
    if (
      error instanceof Error &&
      error.message.includes('During prerendering, `cookies()` rejects')
    ) {
      console.log(
        'Cookies not available during prerendering, returning null session'
      )
      return null
    }

    console.error('Error getting session:', error)
    return null
  }
})

// Delete session by clearing the JWT cookie
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
