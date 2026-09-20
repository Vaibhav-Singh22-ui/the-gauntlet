import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcajfrrlgksvequyallj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWpmcnJsZ2tzdmVxdXlhbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTg0NzUsImV4cCI6MjEwNTQ3NDQ3NX0.YyfTyfFe4DSykqSa7ELmeQIjaiCcKMrVPWMNWHS4p7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
