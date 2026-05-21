import { createClient } from '@supabase/supabase-js'

// معلومات Supabase الخاصة بك
const supabaseUrl = 'https://ohfsvwuyoefbyzlyierz.supabase.co'
const supabaseAnonKey = 'sb_publishable_MwgZ-xcBr9kvJRuO75NNcQ_bWpf2oJF'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
