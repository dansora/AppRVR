import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These variables should be set in your environment variables.
// Do not hardcode them in a real application.
// For this example, we use placeholder values. You will need to replace them
// with your actual Supabase project URL and anon key.
const supabaseUrl = process.env.SUPABASE_URL || 'https://ribczdqsjjulcpyknbwt.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYmN6ZHFzamp1bGNweWtuYnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjg4MDIsImV4cCI6MjA3NjY0NDgwMn0.OvBaryC_NtCHZbtrQ3f-6k2gz9XfmrKkVy32Qez0RpA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
