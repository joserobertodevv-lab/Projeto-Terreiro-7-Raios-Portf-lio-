// Funções para gerenciar painel da lojinha

async function carregarProdutos() {
    try {
        const { data, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        const tbody = document.getElementById('produtos-table');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(produto => `
            <tr>
                <td>${produto.nome}</td>
                <td>R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</td>
                <td>${produto.estoque}</td>
                <td>${produto.ativo ? '<span style="color: #28a745;">Ativo</span>' : '<span style="color: #dc3545;">Inativo</span>'}</td>
                <td>
                    <button class="btn btn-small btn-marrom" onclick="editarProduto(${produto.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="excluirProduto(${produto.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('produtos-table').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: #dc3545;">Erro ao carregar produtos.</td></tr>';
    }
}

async function salvarProduto() {
    const id = document.getElementById('produto-id').value;
    const produto = {
        nome: document.getElementById('produto-nome').value,
        descricao: document.getElementById('produto-descricao').value || null,
        preco: parseFloat(document.getElementById('produto-preco').value),
        estoque: parseInt(document.getElementById('produto-estoque').value),
        imagem_url: document.getElementById('produto-imagem').value || null,
        ativo: document.getElementById('produto-ativo').checked
    };

    try {
        let result;
        if (id) {
            // Atualizar
            const { data, error } = await supabaseClient
                .from('produtos')
                .update(produto)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            result = data[0];
        } else {
            // Criar
            const { data, error } = await supabaseClient
                .from('produtos')
                .insert([produto])
                .select();
            
            if (error) throw error;
            result = data[0];
        }

        mostrarAlerta('Produto salvo com sucesso!', 'success');
        document.getElementById('formulario-container').style.display = 'none';
        carregarProdutos();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        mostrarAlerta('Erro ao salvar produto: ' + error.message, 'error');
    }
}

async function editarProduto(id) {
    try {
        const { data, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('produto-id').value = data.id;
        document.getElementById('produto-nome').value = data.nome;
        document.getElementById('produto-descricao').value = data.descricao || '';
        document.getElementById('produto-preco').value = data.preco;
        document.getElementById('produto-estoque').value = data.estoque;
        document.getElementById('produto-imagem').value = data.imagem_url || '';
        document.getElementById('produto-ativo').checked = data.ativo;
        document.getElementById('form-titulo').textContent = 'Editar Produto';
        document.getElementById('formulario-container').style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        mostrarAlerta('Erro ao carregar produto para edição', 'error');
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarAlerta('Produto excluído com sucesso!', 'success');
        carregarProdutos();
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        mostrarAlerta('Erro ao excluir produto: ' + error.message, 'error');
    }
}

function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById('alert-container');
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-error';
    container.innerHTML = `<div class="alert ${alertClass}">${mensagem}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}
