import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/graveyard.db'
  : './graveyard.db'

const sqlite = new Database(dbPath)

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS graves (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    death_date TEXT NOT NULL,
    cause_of_death TEXT NOT NULL,
    epitaph TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    star_count INTEGER,
    respect_count INTEGER NOT NULL DEFAULT 0,
    submitted_by TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  )
`)

const nowIso = new Date().toISOString()

const seeds = [
  {
    name: 'Weekend Wunderkind',
    url: 'https://github.com/example/weekend-wunderkind',
    birthDate: '2022-07-10',
    deathDate: '2022-07-17',
    causeOfDeath: 'Killed by scope creep',
    epitaph: 'Shipped a README. Never shipped the app.',
    techStack: ['React', 'TypeScript', 'Vite'],
    starCount: 42,
    respectCount: 5,
    submittedBy: 'Local Undertaker',
  },
  {
    name: 'LLM Task Manager',
    url: 'https://github.com/example/llm-task-manager',
    birthDate: '2023-02-01',
    deathDate: '2023-03-22',
    causeOfDeath: 'Died of AI hype',
    epitaph: 'The agent planned, but never acted.',
    techStack: ['Next.js', 'TailwindCSS', 'OpenAI'],
    starCount: 388,
    respectCount: 22,
    submittedBy: null,
  },
  {
    name: 'Cloud Gravekeeper',
    url: 'https://github.com/example/cloud-gravekeeper',
    birthDate: '2021-04-13',
    deathDate: '2022-01-08',
    causeOfDeath: 'Starved of funding',
    epitaph: 'SaaS dreams, hobby budget.',
    techStack: ['Node.js', 'PostgreSQL', 'Docker'],
    starCount: 1200,
    respectCount: 84,
    submittedBy: 'Ops Ghost',
  },
  {
    name: 'Rewrite of Theseus',
    url: 'https://github.com/example/rewrite-theseus',
    birthDate: '2020-09-15',
    deathDate: '2022-06-30',
    causeOfDeath: 'Lost in a rewrite',
    epitaph: 'Eventually became a different project entirely.',
    techStack: ['Rust', 'WASM', 'Svelte'],
    starCount: 310,
    respectCount: 31,
    submittedBy: null,
  },
  {
    name: 'Microservice Maze',
    url: 'https://github.com/example/microservice-maze',
    birthDate: '2019-03-01',
    deathDate: '2019-12-12',
    causeOfDeath: 'Murdered by technical debt',
    epitaph: 'Eighty repos. Zero deploys.',
    techStack: ['Go', 'Kubernetes', 'Redis'],
    starCount: 77,
    respectCount: 9,
    submittedBy: 'Infra Gremlin',
  },
  {
    name: 'Pixel Prophet',
    url: 'https://github.com/example/pixel-prophet',
    birthDate: '2024-01-02',
    deathDate: '2024-01-30',
    causeOfDeath: 'Ghosted by maintainer',
    epitaph: 'It foretold bugs, but not its own.',
    techStack: ['Vue', 'TypeScript', 'Supabase'],
    starCount: 14,
    respectCount: 2,
    submittedBy: 'Anonymous',
  },
]

const existingNames = new Set(
  sqlite.prepare('SELECT name FROM graves').all().map((row) => row.name)
)

const insert = sqlite.prepare(`
  INSERT INTO graves (
    id,
    name,
    url,
    birth_date,
    death_date,
    cause_of_death,
    epitaph,
    tech_stack,
    star_count,
    respect_count,
    submitted_by,
    status,
    created_at
  ) VALUES (
    @id,
    @name,
    @url,
    @birthDate,
    @deathDate,
    @causeOfDeath,
    @epitaph,
    @techStack,
    @starCount,
    @respectCount,
    @submittedBy,
    @status,
    @createdAt
  )
`)

const insertMany = sqlite.transaction((items) => {
  for (const item of items) insert.run(item)
})

const rowsToInsert = seeds
  .filter((seed) => !existingNames.has(seed.name))
  .map((seed) => ({
    id: nanoid(),
    name: seed.name,
    url: seed.url,
    birthDate: seed.birthDate,
    deathDate: seed.deathDate,
    causeOfDeath: seed.causeOfDeath,
    epitaph: seed.epitaph,
    techStack: JSON.stringify(seed.techStack),
    starCount: seed.starCount,
    respectCount: seed.respectCount,
    submittedBy: seed.submittedBy,
    status: 'approved',
    createdAt: nowIso,
  }))

if (rowsToInsert.length === 0) {
  console.log('No new graves to seed. Database already has these entries.')
  process.exit(0)
}

try {
  insertMany(rowsToInsert)
  console.log(`Seeded ${rowsToInsert.length} graves into ${dbPath}`)
} catch (error) {
  console.error('Failed to seed graves:', error)
  process.exit(1)
}
