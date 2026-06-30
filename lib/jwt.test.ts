// @vitest-environment node

import { describe, it, expect, beforeAll } from 'vitest'
import { generateJWT, verifyJWT, getTokenFromRequest } from '@/lib/jwt'
import { NextRequest } from 'next/server'

describe('JWT utilities', () => {
  let validToken: string

  beforeAll(async () => {
    validToken = await generateJWT({ userId: 'user-123' })
  })

  it('generates a verifiable token', async () => {
    const payload = await verifyJWT(validToken)
    expect(payload).not.toBeNull()
    expect(payload?.userId).toBe('user-123')
  })

  it('rejects invalid tokens', async () => {
    const payload = await verifyJWT('not-a-valid-token')
    expect(payload).toBeNull()
  })

  it('extracts Bearer token from Authorization header', () => {
    const request = new NextRequest('http://localhost/api/issue', {
      headers: { Authorization: `Bearer ${validToken}` },
    })
    expect(getTokenFromRequest(request)).toBe(validToken)
  })

  it('extracts token from auth_token cookie', () => {
    const request = new NextRequest('http://localhost/api/issue', {
      headers: { Cookie: `auth_token=${validToken}` },
    })
    expect(getTokenFromRequest(request)).toBe(validToken)
  })
})
