import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const graves = sqliteTable('graves', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  birthDate: text('birth_date').notNull(),
  deathDate: text('death_date').notNull(),
  causeOfDeath: text('cause_of_death').notNull(),
  epitaph: text('epitaph').notNull(),
  techStack: text('tech_stack').notNull(), // JSON array stored as string
  starCount: integer('star_count'),
  respectCount: integer('respect_count').notNull().default(0),
  submittedBy: text('submitted_by'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  createdAt: text('created_at').notNull(),
})

export type Grave = typeof graves.$inferSelect
export type NewGrave = typeof graves.$inferInsert
