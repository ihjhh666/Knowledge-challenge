import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://coyddkbabjxctplveliw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_h86VK_NFP8po-t2j1dExyA_4XdvUC1x';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
