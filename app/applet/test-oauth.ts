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
  console.log("Data generated:");
  console.log(data);
  
  if (data?.url) {
     const res = await fetch(data.url, { redirect: 'manual' });
     console.log("Status:", res.status);
     console.log("Location header:", res.headers.get('location'));
     
     const loc = res.headers.get('location');
     if (loc) {
        const urlObj = new URL(loc);
        console.log("ACTUAL_REDIRECT_URI =", urlObj.searchParams.get('redirect_uri'));
     }
  }
}
run();
