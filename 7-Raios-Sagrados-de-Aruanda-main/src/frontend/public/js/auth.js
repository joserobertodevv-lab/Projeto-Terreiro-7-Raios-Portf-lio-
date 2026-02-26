// Funções de autenticação

// Verificar se o usuário está autenticado
async function verificarAutenticacao() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session !== null;
}

// Fazer login
async function fazerLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        throw error;
    }
    
    return data;
}

// Fazer logout
async function fazerLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        throw error;
    }
}

// Obter usuário atual
async function obterUsuarioAtual() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// Verificar se é filho de santo (verificar role na tabela de perfis)
async function verificarFilhoSanto() {
    const user = await obterUsuarioAtual();
    if (!user) return false;
    
    const { data, error } = await supabaseClient
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error || !data) return false;
    return data.role === 'filho' || data.role === 'admin';
}

// Verificar se é admin da lojinha
async function verificarAdminLojinha() {
    const user = await obterUsuarioAtual();
    if (!user) return false;
    
    const { data, error } = await supabaseClient
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error || !data) return false;
    return data.role === 'admin_lojinha' || data.role === 'admin';
}

// Verificar se é admin (dirigente) da área interna
async function verificarAdminInterno() {
    const user = await obterUsuarioAtual();
    if (!user) return false;
    
    const { data, error } = await supabaseClient
        .from('perfis')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
}
