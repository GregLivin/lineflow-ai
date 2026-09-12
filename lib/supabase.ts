import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyzwncnjpqgoqclxqbua.supabase.co';
const supabasePublishableKey = 'sb_publishable_Fw8H6yS7j5CZSmkStdT3BA_0Wx_JC2h';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
