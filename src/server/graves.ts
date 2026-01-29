import { createServerFn } from '@tanstack/react-start'
import { eq, desc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from './db'
import { graves, type Grave, type NewGrave } from './schema'

// Get all approved graves
export const getGraves = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(graves)
    .where(eq(graves.status, 'approved'))
    .orderBy(desc(graves.createdAt))
})

// Get a single grave by ID
export const getGrave = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const result = await db.select().from(graves).where(eq(graves.id, id))
    return result[0] || null
  })

// Submit a new grave (goes to pending)
export const submitGrave = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      url: string
      birthDate: string
      deathDate: string
      causeOfDeath: string
      epitaph: string
      techStack: string[]
      starCount?: number
      submittedBy?: string
    }) => data
  )
  .handler(async ({ data }) => {
    const newGrave: NewGrave = {
      id: nanoid(),
      name: data.name,
      url: data.url,
      birthDate: data.birthDate,
      deathDate: data.deathDate,
      causeOfDeath: data.causeOfDeath,
      epitaph: data.epitaph,
      techStack: JSON.stringify(data.techStack),
      starCount: data.starCount || null,
      submittedBy: data.submittedBy || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    await db.insert(graves).values(newGrave)
    return { success: true, id: newGrave.id }
  })

// Admin: Get pending graves
export const getPendingGraves = createServerFn({ method: 'GET' })
  .inputValidator((password: string) => password)
  .handler(async ({ data: password }) => {
    if (password !== process.env.ADMIN_PASSWORD) {
      throw new Error('Unauthorized')
    }
    return db
      .select()
      .from(graves)
      .where(eq(graves.status, 'pending'))
      .orderBy(desc(graves.createdAt))
  })

// Admin: Approve or reject a grave
export const moderateGrave = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id: string; status: 'approved' | 'rejected'; password: string }) =>
      data
  )
  .handler(async ({ data }) => {
    if (data.password !== process.env.ADMIN_PASSWORD) {
      throw new Error('Unauthorized')
    }

    await db
      .update(graves)
      .set({ status: data.status })
      .where(eq(graves.id, data.id))

    return { success: true }
  })

// Helper to parse tech stack from stored JSON
export function parseTechStack(grave: Grave): string[] {
  try {
    return JSON.parse(grave.techStack)
  } catch {
    return []
  }
}
