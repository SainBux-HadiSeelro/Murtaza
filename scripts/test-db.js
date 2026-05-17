const { neon } = require('@neondatabase/serverless');

const url = 'postgresql://neondb_owner:npg_74SfBgvioHtW@ep-floral-brook-aosas1u6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function test() {
  try {
    const sql = neon(url);
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connected! Result:', result);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

test();
