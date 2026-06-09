import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://coyddkbabjxctplveliw.supabase.co', 'sb_publishable_h86VK_NFP8po-t2j1dExyA_4XdvUC1x');

async function run() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000',
      skipBrowserRedirect: false
    }
  });
  console.log(data);
}
run();
