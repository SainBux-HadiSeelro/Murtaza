import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ysmccfszlutetlathgpo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_y3rk5z-Itrz0JO4V4s-eVQ_WGauRCFA';

export const supabase = createClient(supabaseUrl, supabaseKey);
