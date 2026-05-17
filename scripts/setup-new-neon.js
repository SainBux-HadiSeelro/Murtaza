// Run this after creating a new Neon project
// New connection string goes here
const NEW_DB_URL = process.argv[2];

if (!NEW_DB_URL) {
  console.log('Usage: node scripts/setup-new-neon.js "postgresql://..."');
  process.exit(1);
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(NEW_DB_URL);

async function setup() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guest_entries (
        id                  TEXT PRIMARY KEY,
        name                TEXT NOT NULL,
        phone               TEXT NOT NULL DEFAULT '',
        message             TEXT NOT NULL,
        photo_url           TEXT,
        event               TEXT NOT NULL DEFAULT 'shadi',
        status              TEXT NOT NULL DEFAULT 'pending',
        show_photo          BOOLEAN NOT NULL DEFAULT true,
        timestamp           BIGINT NOT NULL,
        original_photo_kb   INTEGER,
        compressed_photo_kb INTEGER
      )
    `;
    console.log('✅ Table created!');
    console.log('\nAdd this to .env.local and Vercel:');
    console.log('DATABASE_URL=' + NEW_DB_URL);
  } catch(e) {
    console.error('❌', e.message);
  }
}
setup();
