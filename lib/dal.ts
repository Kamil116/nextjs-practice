// dal = data access layer
import { db } from '@/db'
import { getSession } from './auth'
import { eq, sql } from 'drizzle-orm'
import { issues, users } from '@/db/schema'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import { cache } from 'react'

export const getCurrentUser= cache(async () => {
  const session = await getSession()
  if (!session) {
    return null
  }

  try {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))

    return results[0] || null
  } catch (e) {
    console.error(e)
    return null
  }
})

export const getUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()

  try {
    return await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${normalizedEmail}`,
    })
  } catch (e) {
    console.error('getUserByEmail failed:', e)
    throw e
  }
}

export async function getIssues() {
  'use cache'
  cacheTag('issues')
  try {
    return await db.query.issues.findMany({
      with: {
        user: true,
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw new Error('Failed to fetch issues')
  }
}


export async function getIssue(id: number) {
  try {
    return await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        user: true,
      }
    })
  } catch (e) {
    console.error('Error fetching issue:', id, e)
    throw new Error('Failed to fetch issue')
  }
}
