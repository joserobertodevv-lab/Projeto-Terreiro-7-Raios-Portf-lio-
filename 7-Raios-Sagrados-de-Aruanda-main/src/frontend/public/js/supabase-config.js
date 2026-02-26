// Configuração do Supabase
// Substitua estas variáveis pelas suas credenciais do Supabase
const SUPABASE_URL = ''
const SUPABASE_ANON_KEY = '';

// Inicializar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

