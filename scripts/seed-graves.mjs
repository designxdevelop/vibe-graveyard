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

// Reset database - delete all existing graves
console.log('Resetting database...')
sqlite.exec('DELETE FROM graves')

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
  {
    name: 'Blockchain Ballot',
    url: 'https://github.com/example/blockchain-ballot',
    birthDate: '2021-11-01',
    deathDate: '2022-02-14',
    causeOfDeath: 'Gas fees exceeded budget',
    epitaph: 'Democracy was too expensive.',
    techStack: ['Solidity', 'Hardhat', 'React'],
    starCount: 856,
    respectCount: 44,
    submittedBy: 'Crypto Mourner',
  },
  {
    name: 'Async Overthink',
    url: 'https://github.com/example/async-overthink',
    birthDate: '2023-06-15',
    deathDate: '2023-08-20',
    causeOfDeath: 'Promise rejection',
    epitaph: 'await-ed forever, resolved never.',
    techStack: ['Deno', 'TypeScript', 'Fresh'],
    starCount: 23,
    respectCount: 7,
    submittedBy: null,
  },
  {
    name: 'CLI Crusader',
    url: 'https://github.com/example/cli-crusader',
    birthDate: '2020-01-10',
    deathDate: '2020-04-22',
    causeOfDeath: 'Replaced by a shell alias',
    epitaph: 'Five thousand lines for what bash did in one.',
    techStack: ['Rust', 'Clap', 'Tokio'],
    starCount: 189,
    respectCount: 15,
    submittedBy: 'Terminal Priest',
  },
  {
    name: 'OAuth Odyssey',
    url: 'https://github.com/example/oauth-odyssey',
    birthDate: '2022-03-01',
    deathDate: '2022-03-02',
    causeOfDeath: 'Callback URL misconfigured',
    epitaph: 'The redirect led nowhere.',
    techStack: ['Express', 'Passport', 'MongoDB'],
    starCount: 3,
    respectCount: 1,
    submittedBy: 'Auth Phantom',
  },
  {
    name: 'Design System Delta',
    url: 'https://github.com/example/design-system-delta',
    birthDate: '2021-08-01',
    deathDate: '2023-12-31',
    causeOfDeath: 'Death by committee',
    epitaph: 'Thirty-seven shades of blue, zero shipped components.',
    techStack: ['Storybook', 'Figma', 'React'],
    starCount: 2400,
    respectCount: 156,
    submittedBy: 'Design Wraith',
  },
  {
    name: 'Serverless Spaghetti',
    url: 'https://github.com/example/serverless-spaghetti',
    birthDate: '2022-09-01',
    deathDate: '2023-01-15',
    causeOfDeath: 'Cold start timeout',
    epitaph: 'It woke up just in time to die.',
    techStack: ['AWS Lambda', 'DynamoDB', 'Python'],
    starCount: 67,
    respectCount: 11,
    submittedBy: null,
  },
  {
    name: 'GraphQL Graveyard',
    url: 'https://github.com/example/graphql-graveyard',
    birthDate: '2020-05-20',
    deathDate: '2021-11-11',
    causeOfDeath: 'N+1 query apocalypse',
    epitaph: 'Asked for everything. Got nothing.',
    techStack: ['Apollo', 'Prisma', 'TypeGraphQL'],
    starCount: 543,
    respectCount: 38,
    submittedBy: 'Query Specter',
  },
  {
    name: 'Monorepo Mirage',
    url: 'https://github.com/example/monorepo-mirage',
    birthDate: '2021-01-01',
    deathDate: '2022-07-04',
    causeOfDeath: 'Circular dependency implosion',
    epitaph: 'All packages depended on each other. None worked.',
    techStack: ['Turborepo', 'pnpm', 'TypeScript'],
    starCount: 234,
    respectCount: 19,
    submittedBy: 'Workspace Wraith',
  },
  {
    name: 'WebSocket Whispers',
    url: 'https://github.com/example/websocket-whispers',
    birthDate: '2023-04-01',
    deathDate: '2023-04-03',
    causeOfDeath: 'Connection forcefully closed',
    epitaph: 'It spoke, but no one was listening.',
    techStack: ['Socket.io', 'Redis', 'Node.js'],
    starCount: 12,
    respectCount: 4,
    submittedBy: null,
  },
  {
    name: 'CSS Framework Frankenstein',
    url: 'https://github.com/example/css-frankenstein',
    birthDate: '2019-06-01',
    deathDate: '2020-01-01',
    causeOfDeath: 'Specificity wars',
    epitaph: '!important was not important enough.',
    techStack: ['SCSS', 'PostCSS', 'Tailwind'],
    starCount: 891,
    respectCount: 67,
    submittedBy: 'Style Shade',
  },
  {
    name: 'Test Suite Tragedy',
    url: 'https://github.com/example/test-suite-tragedy',
    birthDate: '2022-01-15',
    deathDate: '2022-01-16',
    causeOfDeath: 'Flaky test drove everyone insane',
    epitaph: 'Green on local. Red on CI. Always.',
    techStack: ['Jest', 'Playwright', 'Cypress'],
    starCount: 156,
    respectCount: 88,
    submittedBy: 'QA Ghoul',
  },
  {
    name: 'Mobile Mausoleum',
    url: 'https://github.com/example/mobile-mausoleum',
    birthDate: '2021-02-14',
    deathDate: '2023-09-30',
    causeOfDeath: 'App Store rejection spiral',
    epitaph: 'Violated guideline 4.2. And 2.1. And 3.1.1.',
    techStack: ['React Native', 'Expo', 'Firebase'],
    starCount: 445,
    respectCount: 52,
    submittedBy: 'App Apparition',
  },
]

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

const rowsToInsert = seeds.map((seed, index) => ({
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
  // Stagger createdAt so ordering is deterministic
  createdAt: new Date(Date.now() - index * 1000).toISOString(),
}))

try {
  insertMany(rowsToInsert)
  console.log(`Seeded ${rowsToInsert.length} graves into ${dbPath}`)
} catch (error) {
  console.error('Failed to seed graves:', error)
  process.exit(1)
}
