import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yuyflyvtxwhmathuxtrr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1eWZseXZ0eHdobWF0aHV4dHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTk1MDMsImV4cCI6MjA4MTEzNTUwM30.v0e2_tNwm6-sHQOzWIzqwJ8-LKgehWF3xJ1nCVKqRek'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)