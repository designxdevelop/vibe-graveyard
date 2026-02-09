import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from './schema'

// Type for our Cloudflare env bindings
interface CloudflareEnv {
  DB: D1Database
  ADMIN_PASSWORD?: string
  [key: string]: unknown
}

/**
 * Get the Cloudflare env bindings from the current request context.
 * Nitro sets `globalThis.__env__` on each incoming request in the
 * cloudflare_module preset (see nitro/dist/presets/cloudflare/runtime/_module-handler.mjs).
 */
function getCloudflareEnv(): CloudflareEnv {
  const env = (globalThis as Record<string, unknown>).__env__ as CloudflareEnv | undefined
  if (!env) {
    throw new Error(
      'Cloudflare env bindings not available. ' +
      'Make sure you are calling this within a request handler on Cloudflare Workers.'
    )
  }
  return env
}

/**
 * Get a Drizzle ORM instance backed by Cloudflare D1.
 * Call this inside each server function handler — D1 bindings are
 * per-request and cannot be cached as a module-level singleton.
 */
export function getDb(): DrizzleD1Database<typeof schema> {
  const env = getCloudflareEnv()
  return drizzle(env.DB, { schema })
}

/**
 * Get an environment variable from the Cloudflare env bindings.
 * Use this instead of process.env for values that need to be
 * available in the Workers runtime.
 */
export function getEnv(key: string): string | undefined {
  const env = getCloudflareEnv()
  return env[key] as string | undefined
}
