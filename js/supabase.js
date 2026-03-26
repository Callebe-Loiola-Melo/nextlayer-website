import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// A URL que está na sua segunda foto
const supabaseUrl = 'https://naqdqeqsplgxowzekxvb.supabase.co'

// Aqui você cola aquela primeira chave compriiiida da primeira foto (anon public)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcWRxZXFzcGxneG93emVreHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDU3MTAsImV4cCI6MjA4OTg4MTcxMH0.MAxXZo3reGtREgJxyokn-UVRBhvOGGQl_Q7Q6VySOxE'

export const supabase = createClient(supabaseUrl, supabaseKey)