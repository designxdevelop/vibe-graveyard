import { createServerFn } from '@tanstack/react-start'
import { eq, desc, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from './db'
import { graves, globalStats, type Grave, type NewGrave } from './schema'

// Get approved graves with pagination
export const getGraves = createServerFn({ method: 'GET' })
  .inputValidator((data?: { limit?: number; offset?: number }) => data || {})
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 6
    const offset = data?.offset ?? 0

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(graves)
      .where(eq(graves.status, 'approved'))
    const total = Number(countResult[0]?.count ?? 0)

    // Get paginated results
    const results = await db
      .select()
      .from(graves)
      .where(eq(graves.status, 'approved'))
      .orderBy(desc(graves.createdAt))
      .limit(limit)
      .offset(offset)

    const hasMore = offset + results.length < total

    return { graves: results, hasMore, total }
  })

export const getGlobalRespects = createServerFn({ method: 'GET' }).handler(async () => {
  await db
    .insert(globalStats)
    .values({ id: 'global', respectCount: 0, updatedAt: new Date().toISOString() })
    .onConflictDoNothing()

  const result = await db
    .select({ respectCount: globalStats.respectCount })
    .from(globalStats)
    .where(eq(globalStats.id, 'global'))

  return result[0]?.respectCount ?? 0
})

export const incrementGlobalRespects = createServerFn({ method: 'POST' })
  .handler(async () => {
    await db
      .insert(globalStats)
      .values({ id: 'global', respectCount: 0, updatedAt: new Date().toISOString() })
      .onConflictDoNothing()

    const result = await db
      .update(globalStats)
      .set({
        respectCount: sql`${globalStats.respectCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(globalStats.id, 'global'))
      .returning({ respectCount: globalStats.respectCount })

    return { respectCount: result[0]?.respectCount ?? 0 }
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

// Admin: Get all graves (including approved)
export const getAllGraves = createServerFn({ method: 'GET' })
  .inputValidator((password: string) => password)
  .handler(async ({ data: password }) => {
    if (password !== process.env.ADMIN_PASSWORD) {
      throw new Error('Unauthorized')
    }
    return db
      .select()
      .from(graves)
      .orderBy(desc(graves.createdAt))
  })

// Admin: Delete a grave
export const deleteGrave = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (data.password !== process.env.ADMIN_PASSWORD) {
      throw new Error('Unauthorized')
    }
    
    await db.delete(graves).where(eq(graves.id, data.id))
    return { success: true }
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

// Admin: Update a grave's details
export const updateGrave = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string
      password: string
      updates: {
        name?: string
        url?: string
        birthDate?: string
        deathDate?: string
        causeOfDeath?: string
        epitaph?: string
        techStack?: string[]
        starCount?: number | null
      }
    }) => data
  )
  .handler(async ({ data }) => {
    if (data.password !== process.env.ADMIN_PASSWORD) {
      throw new Error('Unauthorized')
    }

    const updates: Record<string, unknown> = {}
    if (data.updates.name) updates.name = data.updates.name
    if (data.updates.url) updates.url = data.updates.url
    if (data.updates.birthDate) updates.birthDate = data.updates.birthDate
    if (data.updates.deathDate) updates.deathDate = data.updates.deathDate
    if (data.updates.causeOfDeath) updates.causeOfDeath = data.updates.causeOfDeath
    if (data.updates.epitaph) updates.epitaph = data.updates.epitaph
    if (data.updates.techStack) updates.techStack = JSON.stringify(data.updates.techStack)
    if (data.updates.starCount !== undefined) updates.starCount = data.updates.starCount

    await db
      .update(graves)
      .set(updates)
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

// Pay respects to a grave (increment respect count)
export const payRespects = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const result = await db
      .update(graves)
      .set({ respectCount: sql`${graves.respectCount} + 1` })
      .where(eq(graves.id, id))
      .returning({ respectCount: graves.respectCount })
    
    return { respectCount: result[0]?.respectCount ?? 0 }
  })

// Fetch GitHub stars from a repo URL
export const fetchGitHubStars = createServerFn({ method: 'POST' })
  .inputValidator((url: string) => url)
  .handler(async ({ data: url }) => {
    // Parse GitHub URL to extract owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i)
    if (!match) {
      return { stars: null, error: 'Not a valid GitHub URL' }
    }

    const [, owner, repo] = match
    // Remove .git suffix if present
    const repoName = repo.replace(/\.git$/, '')

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'vibe-graveyard',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          return { stars: null, error: 'Repository not found' }
        }
        return { stars: null, error: 'Failed to fetch repository data' }
      }

      const data = await response.json()
      return { stars: data.stargazers_count, error: null }
    } catch (err) {
      return { stars: null, error: 'Failed to connect to GitHub' }
    }
  })
