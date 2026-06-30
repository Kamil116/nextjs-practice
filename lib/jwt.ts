import * as jose from 'jose'
import type { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  [key: string]: string | number | boolean | null | undefined
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
)

export const JWT_EXPIRATION = '7d'
export const REFRESH_THRESHOLD = 24 * 60 * 60 // 24 hours in seconds

export async function generateJWT(payload: JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function shouldRefreshToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      clockTolerance: 15,
    })

    const exp = payload.exp as number
    const now = Math.floor(Date.now() / 1000)

    return exp - now < REFRESH_THRESHOLD
  } catch {
    return false
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  if (authHeader) {
    return authHeader
  }
  return request.cookies.get('auth_token')?.value ?? null
}

export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  const payload = await verifyJWT(token)
  return payload?.userId ?? null
}
