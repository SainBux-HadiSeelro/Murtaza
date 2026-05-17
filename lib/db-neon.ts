import { neon } from '@neondatabase/serverless';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_joiztOMn1xA0@ep-floral-brook-aosas1u6-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);
