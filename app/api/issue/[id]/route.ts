import { NextRequest, NextResponse } from 'next/server'
import { issues } from '@/db/schema'
import { db } from '@/db'
import { and, eq } from 'drizzle-orm'
import { getUserIdFromRequest } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const issueId = parseInt(id, 10)
    if (Number.isNaN(issueId)) {
      return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 })
    }

    const issue = await db.query.issues.findFirst({
      where: and(eq(issues.id, issueId), eq(issues.userId, userId)),
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ data: issue })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 })
  }
}
