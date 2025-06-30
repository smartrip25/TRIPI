import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqyfxzfddptecafavjey.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeWZ4emZkZHB0ZWNhZmF2amV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTgwMzcsImV4cCI6MjA2NTQ5NDAzN30.Wbc-9aWEekW8AIglxTxW9LiOOCxeNzuJ8CTXV1ZtJdM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
