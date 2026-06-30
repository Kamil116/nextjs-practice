import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { issues } from '@/db/schema'
import { getUserIdFromRequest } from '@/lib/jwt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateIssueSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional().nullable(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const allIssues = await db.query.issues.findMany({
      where: (issuesTable, { eq }) => eq(issuesTable.userId, userId),
      orderBy: (issuesTable, { desc }) => [desc(issuesTable.createdAt)],
    })

    return NextResponse.json({ data: { issues: allIssues } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validationResult = CreateIssueSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const [newIssue] = await db
      .insert(issues)
      .values({
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'backlog',
        priority: data.priority ?? 'medium',
        userId,
      })
      .returning()

    return NextResponse.json({ data: newIssue }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 })
  }
}
