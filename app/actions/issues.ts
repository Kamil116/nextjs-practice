'use server'

import { db } from '@/db'
import { issues } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/dal'
import { z } from 'zod'
import { mockDelay } from '@/lib/utils'
import { updateTag } from 'next/cache'

const IssueInputSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z.string().optional().nullable(),

  status: z.enum(['backlog', 'todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),

  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
})

export type IssueData = z.infer<typeof IssueInputSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

async function getOwnedIssue(id: number, userId: string) {
  const issue = await db.query.issues.findFirst({
    where: and(eq(issues.id, id), eq(issues.userId, userId)),
  })
  return issue ?? null
}

export async function createIssue(data: IssueData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    const validationResult = IssueInputSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const validatedData = validationResult.data
    await db.insert(issues).values({
      title: validatedData.title,
      description: validatedData.description || null,
      status: validatedData.status,
      priority: validatedData.priority,
      userId: user.id,
    })

    updateTag('issues')
    return { success: true, message: 'Issue created successfully' }
  } catch (error) {
    console.error('Error creating issue:', error)
    return {
      success: false,
      message: 'An error occurred while creating the issue',
      error: 'Failed to create issue',
    }
  }
}

export async function updateIssue(
  id: number,
  data: Partial<IssueData>
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: 'Unauthorized access',
        error: 'Unauthorized',
      }
    }

    const existingIssue = await getOwnedIssue(id, user.id)
    if (!existingIssue) {
      return {
        success: false,
        message: 'Issue not found or access denied',
        error: 'Forbidden',
      }
    }

    const UpdateIssueSchema = IssueInputSchema.partial()
    const validationResult = UpdateIssueSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Update issue',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    const validatedData = validationResult.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status
    if (validatedData.priority !== undefined)
      updateData.priority = validatedData.priority

    await db
      .update(issues)
      .set(updateData)
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))

    updateTag('issues')
    return {
      success: true,
      message: 'Issue updated successfully',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'An error occurred while updating issue',
      error: 'Failed to update issue',
    }
  }
}

export async function deleteIssue(id: number) {
  try {
    await mockDelay(700)
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const existingIssue = await getOwnedIssue(id, user.id)
    if (!existingIssue) {
      return {
        success: false,
        message: 'Issue not found or access denied',
        error: 'Forbidden',
      }
    }

    await db
      .delete(issues)
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))

    updateTag('issues')
    return { success: true, message: 'Issue deleted successfully' }
  } catch (error) {
    console.error('Error deleting issue:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the issue',
      error: 'Failed to delete issue',
    }
  }
}
