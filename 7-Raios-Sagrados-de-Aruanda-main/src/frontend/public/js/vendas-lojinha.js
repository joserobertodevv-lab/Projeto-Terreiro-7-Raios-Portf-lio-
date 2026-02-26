// Funções para gerenciar vendas da lojinha

let carrinho = [];
let vendasHandlersBound = false;
let vendaEmAndamento = false;

async function carregarProdutos() {
    try {
        if (!vendasHandlersBound) {
            const container = document.getElementById('produtos-container');
            container.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action="add-to-cart"]');
                if (!btn) return;
                const id = parseInt(btn.dataset.id, 10);
                const nome = btn.dataset.nome;
                const preco = parseFloat(btn.dataset.preco);
                const estoque = parseInt(btn.dataset.estoque, 10);
                adicionarAoCarrinho(id, nome, preco, estoque);
            });
            vendasHandlersBound = true;
        }

        const { data, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .eq('ativo', true)
            .order('nome', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('produtos-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">Nenhum produto disponível.</p>';
            return;
        }

        // Render sem onclick inline (evita erro quando nome tem aspas)
        container.innerHTML = data.map(produto => `
            <div class="produto-card">
                ${produto.imagem_url ? `<img src="${produto.imagem_url}" alt="${produto.nome}">` : ''}
                <h3>${produto.nome}</h3>
                <p class="preco">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                ${produto.descricao ? `<p style="color: #666; font-size: 14px;">${produto.descricao}</p>` : ''}
                <p style="color: #666; font-size: 12px; margin-top: 5px;">Estoque: ${produto.estoque}</p>
                <button
                    class="btn btn-marrom"
                    data-action="add-to-cart"
                    data-id="${produto.id}"
                    data-nome="${String(produto.nome).replace(/"/g, '&quot;')}"
                    data-preco="${produto.preco}"
                    data-estoque="${produto.estoque}"
                    ${produto.estoque <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> Adicionar
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('produtos-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545; grid-column: 1 / -1;">Erro ao carregar produtos.</p>';
    }
}

async function carregarFilhos() {
    try {
        const { data, error } = await supabaseClient
            .from('perfis')
            .select('id, nome, email')
            .eq('role', 'filho')
            .order('nome', { ascending: true });

        if (error) throw error;

        const select = document.getElementById('filho-id');
        select.innerHTML = '<option value="">Selecione o filho...</option>' + 
            (data || []).map(filho => 
                `<option value="${filho.id}">${filho.nome || filho.email}</option>`
            ).join('');
    } catch (error) {
        console.error('Erro ao carregar filhos:', error);
    }
}

function adicionarAoCarrinho(id, nome, preco, estoque) {
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        if (itemExistente.quantidade >= estoque) {
            alert('Quantidade máxima em estoque atingida!');
            return;
        }
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: id,
            nome: nome,
            preco: preco,
            quantidade: 1,
            estoque: estoque
        });
    }
    
    atualizarCarrinho();
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
}

function atualizarQuantidade(id, quantidade) {
    const item = carrinho.find(item => item.id === id);
    if (item) {
        if (quantidade <= 0) {
            removerDoCarrinho(id);
        } else if (quantidade > item.estoque) {
            alert('Quantidade máxima em estoque atingida!');
            item.quantidade = item.estoque;
        } else {
            item.quantidade = quantidade;
        }
        atualizarCarrinho();
    }
}

function atualizarCarrinho() {
    const container = document.getElementById('carrinho-container');
    const totalContainer = document.getElementById('carrinho-total');
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Carrinho vazio</p>';
        totalContainer.innerHTML = '<p style="font-size: 20px; font-weight: 700; color: #78350F;">Total: R$ 0,00</p>';
        btnFinalizar.disabled = true;
        return;
    }
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    container.innerHTML = carrinho.map(item => `
        <div class="carrinho-item">
            <div class="carrinho-item-info">
                <h4 style="margin: 0; color: #78350F;">${item.nome}</h4>
                <p style="margin: 5px 0; color: #666;">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')} x ${item.quantidade}</p>
            </div>
            <div class="carrinho-item-actions">
                <input type="number" class="quantidade-input" value="${item.quantidade}" min="1" max="${item.estoque}" 
                       onchange="atualizarQuantidade(${item.id}, parseInt(this.value))">
                <button class="btn btn-small btn-danger" onclick="removerDoCarrinho(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    totalContainer.innerHTML = `<p style="font-size: 20px; font-weight: 700; color: #78350F;">Total: R$ ${total.toFixed(2).replace('.', ',')}</p>`;
    btnFinalizar.disabled = false;
}

function finalizarVenda() {
    if (carrinho.length === 0) return;
    document.getElementById('modal-finalizar').style.display = 'flex';
}

async function processarVenda() {
    if (vendaEmAndamento) return; // trava duplo clique / duplo submit
    vendaEmAndamento = true;

    const formaPagamento = document.getElementById('forma-pagamento').value;
    const filhoId = document.getElementById('filho-id').value;
    const alertContainer = document.getElementById('alert-container');
    const btnConfirmar = document.querySelector('#finalizar-form button[type="submit"]');
    if (btnConfirmar) btnConfirmar.disabled = true;
    
    if (formaPagamento === 'anotar' && !filhoId) {
        alertContainer.innerHTML = '<div class="alert alert-error">Selecione o filho de santo para anotar na conta.</div>';
        return;
    }
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const user = await obterUsuarioAtual();
    
    try {
        // Criar venda
        const { data: venda, error: vendaError } = await supabaseClient
            .from('vendas')
            .insert([{
                total: total,
                forma_pagamento: formaPagamento,
                filho_id: formaPagamento === 'anotar' ? filhoId : null,
                vendedor_id: user.id,
                itens: carrinho.map(item => ({
                    produto_id: item.id,
                    nome: item.nome,
                    preco: item.preco,
                    quantidade: item.quantidade
                }))
            }])
            .select()
            .single();
        
        if (vendaError) throw vendaError;
        
        // Atualizar estoque
        for (const item of carrinho) {
            const { error: estoqueError } = await supabaseClient
                .from('produtos')
                .update({ estoque: item.estoque - item.quantidade })
                .eq('id', item.id);
            
            if (estoqueError) throw estoqueError;
        }
        
        // Se for anotar, atualizar conta do filho
        if (formaPagamento === 'anotar') {
            const { data: conta, error: contaError } = await supabaseClient
                .from('contas_filhos')
                .select('valor')
                .eq('filho_id', filhoId)
                .single();
            
            if (contaError && contaError.code !== 'PGRST116') {
                throw contaError;
            }
            
            const valorAtual = conta ? conta.valor : 0;
            const novoValor = valorAtual + total;
            
            if (conta) {
                await supabaseClient
                    .from('contas_filhos')
                    .update({ valor: novoValor })
                    .eq('filho_id', filhoId);
            } else {
                await supabaseClient
                    .from('contas_filhos')
                    .insert([{ filho_id: filhoId, valor: novoValor }]);
            }
        }
        
        alertContainer.innerHTML = '<div class="alert alert-success">Venda realizada com sucesso!</div>';
        carrinho = [];
        atualizarCarrinho();
        fecharModal();
        carregarProdutos(); // Recarregar produtos para atualizar estoque
        
        setTimeout(() => {
            fecharModal();
        }, 2000);
    } catch (error) {
        console.error('Erro ao processar venda:', error);
        alertContainer.innerHTML = `<div class="alert alert-error">Erro ao processar venda: ${error.message}</div>`;
    } finally {
        vendaEmAndamento = false;
        if (btnConfirmar) btnConfirmar.disabled = false;
    }
}

function fecharModal() {
    document.getElementById('modal-finalizar').style.display = 'none';
    document.getElementById('finalizar-form').reset();
    document.getElementById('filho-container').style.display = 'none';
}
