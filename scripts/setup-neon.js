const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_7IhLqkxJes1V@ep-spring-meadow-aq71eoh3.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function setup() {
  try {
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS guest_entries (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        phone       TEXT NOT NULL DEFAULT '',
        message     TEXT NOT NULL,
        photo_url   TEXT,
        event       TEXT NOT NULL DEFAULT 'shadi',
        status      TEXT NOT NULL DEFAULT 'pending',
        show_photo  BOOLEAN NOT NULL DEFAULT true,
        timestamp   BIGINT NOT NULL
      )
    `;
    console.log('✅ Table created successfully');

    // Test insert
    const testId = 'test_' + Date.now();
    await sql`
      INSERT INTO guest_entries (id, name, phone, message, event, status, show_photo, timestamp)
      VALUES (${testId}, 'Test User', '', 'Test message', 'shadi', 'pending', true, ${Date.now()})
    `;
    console.log('✅ Test insert successful');

    // Test select
    const rows = await sql`SELECT id, name, status FROM guest_entries LIMIT 5`;
    console.log('✅ Test select:', JSON.stringify(rows));

    // Clean up test row
    await sql`DELETE FROM guest_entries WHERE id = ${testId}`;
    console.log('✅ Test cleanup done');
    console.log('\n🎉 Neon database is ready!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

setup();
