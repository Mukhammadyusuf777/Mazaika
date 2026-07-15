import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mmkdcbwwznigfykchcei.supabase.co'
const supabaseKey = 'sb_publishable_tYvBPJKp5xzqTUTOrPtVCA_uC9AIzff'

export const supabase = createClient(supabaseUrl, supabaseKey)
