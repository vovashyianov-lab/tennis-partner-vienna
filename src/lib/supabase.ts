import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://zmycxnempaukkmnsnsnv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_UFpLw-0goWTrXwSYz72pfg_2EkLGpha';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);