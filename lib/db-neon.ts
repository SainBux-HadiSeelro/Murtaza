/**
 * Neon PostgreSQL client — replaces Supabase entirely.
 * Never pauses, always available on free tier.
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_7IhLqkxJes1V@ep-spring-meadow-aq71eoh3.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);
