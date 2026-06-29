import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { issues } from '@/db/schema'
import { getCurrentUser } from '@/lib/dal'


export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const issues = await db.query.issues.findMany()
    return NextResponse.json({data: {issues}})
  } catch (e) {
    console.error(e)
    return NextResponse.json({error: e}, {status: 500})
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const newIssueData = await req.json()
    const newIssue = await db.insert(issues).values({userId: user?.id, ...newIssueData})
    return NextResponse.json({data: [newIssue]})
  } catch (e) {
    console.error(e)
    return NextResponse.json({error: e}, {status: 500})
  }
}