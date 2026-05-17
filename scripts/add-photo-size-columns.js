const { neon } = require('@neondatabase/serverless');

const DATABASE_URL =
  'postgresql://neondb_owner:npg_7IhLqkxJes1V@ep-spring-meadow-aq71eoh3.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(DATABASE_URL);

async function migrate() {
  try {
    await sql`ALTER TABLE guest_entries ADD COLUMN IF NOT EXISTS original_photo_kb INTEGER`;
    console.log('✅ Column added: original_photo_kb');

    await sql`ALTER TABLE guest_entries ADD COLUMN IF NOT EXISTS compressed_photo_kb INTEGER`;
    console.log('✅ Column added: compressed_photo_kb');

    console.log('\n🎉 Migration complete!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

migrate();
