import { neon } from '@neondatabase/serverless';

// DATABASE_URL must be set in environment variables (Vercel / .env.local)
// Never hardcode credentials here — use the env var only
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(DATABASE_URL);
