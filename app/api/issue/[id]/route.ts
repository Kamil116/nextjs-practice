import { NextRequest, NextResponse } from 'next/server'
import { issues } from '@/db/schema'
import { db } from '@/db'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest, { params }: {params: Promise<{id: string}>}) {
  try {
    const { id } = await params
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parseInt(id))
    })

    return NextResponse.json({ data: issue })
  } catch (e) {
    console.error(e)
    return NextResponse.json({error: e}, {status: 404})
  }
}