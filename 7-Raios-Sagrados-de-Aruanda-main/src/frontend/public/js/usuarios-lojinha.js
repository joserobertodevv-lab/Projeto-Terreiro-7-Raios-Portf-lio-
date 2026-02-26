// Funções para gerenciar usuários da lojinha

async function carregarUsuarios() {
    try {
        const { data, error } = await supabaseClient
            .from('perfis')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        const tbody = document.getElementById('usuarios-table');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        const roleLabels = {
            'admin': 'Administrador',
            'admin_lojinha': 'Admin Lojinha',
            'filho': 'Filho de Santo'
        };

        tbody.innerHTML = data.map(usuario => `
            <tr>
                <td>${usuario.nome || 'N/A'}</td>
                <td>${usuario.email || 'N/A'}</td>
                <td>${roleLabels[usuario.role] || usuario.role}</td>
                <td>
                    <button class="btn btn-small btn-marrom" onclick="editarUsuario(${usuario.id}, '${usuario.role}')">
                        <i class="fas fa-edit"></i> Editar Perfil
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('usuarios-table').innerHTML = 
            '<tr><td colspan="4" style="text-align: center; color: #dc3545;">Erro ao carregar usuários.</td></tr>';
    }
}

async function editarUsuario(id, roleAtual) {
    const novoRole = prompt(`Alterar perfil do usuário?\n\nPerfis disponíveis:\n- admin\n- admin_lojinha\n- filho\n\nPerfil atual: ${roleAtual}\n\nDigite o novo perfil:`);
    
    if (!novoRole || !['admin', 'admin_lojinha', 'filho'].includes(novoRole.toLowerCase())) {
        return;
    }

    try {
        // Atualização de perfil: continua no Supabase direto (exige policy adequada)
        const { error } = await supabaseClient
            .from('perfis')
            .update({ role: novoRole.toLowerCase() })
            .eq('id', id);
        if (error) throw error;

        alert('Perfil atualizado com sucesso!');
        carregarUsuarios();
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Erro ao atualizar perfil: ' + error.message);
    }
}
