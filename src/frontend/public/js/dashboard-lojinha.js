// Funções para gerenciar dashboard da lojinha

async function carregarDashboard() {
    await Promise.all([
        carregarEstatisticas(),
        carregarContas(),
        carregarVendas()
    ]);
}

async function carregarEstatisticas() {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        // Total de vendas do mês
        const { data: vendasMes, error: errorMes } = await supabaseClient
            .from('vendas')
            .select('total')
            .gte('created_at', inicioMes);

        // Total em contas
        const { data: contas, error: errorContas } = await supabaseClient
            .from('contas_filhos')
            .select('valor');

        // Vendas de hoje
        const { data: vendasHoje, error: errorHoje } = await supabaseClient
            .from('vendas')
            .select('id')
            .gte('created_at', hoje);

        if (errorMes || errorContas || errorHoje) {
            throw errorMes || errorContas || errorHoje;
        }

        const totalVendasMes = (vendasMes || []).reduce((sum, v) => sum + parseFloat(v.total), 0);
        const totalContas = (contas || []).reduce((sum, c) => sum + parseFloat(c.valor), 0);

        document.getElementById('total-vendas-mes').textContent = `R$ ${totalVendasMes.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-contas').textContent = `R$ ${totalContas.toFixed(2).replace('.', ',')}`;
        document.getElementById('vendas-hoje').textContent = (vendasHoje || []).length;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function carregarContas() {
    try {
        const { data, error } = await supabaseClient
            .from('contas_filhos')
            .select(`
                *,
                perfis:filho_id (
                    nome,
                    email
                )
            `)
            .order('valor', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('contas-table');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">Nenhuma conta pendente.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(conta => {
            const nome = conta.perfis?.nome || conta.perfis?.email || 'N/A';
            return `
                <tr>
                    <td>${nome}</td>
                    <td>R$ ${parseFloat(conta.valor).toFixed(2).replace('.', ',')}</td>
                    <td>
                        <button class="btn btn-small btn-marrom" onclick="abrirModalAbater(${conta.filho_id}, ${conta.valor})">
                            <i class="fas fa-minus"></i> Abater
                        </button>
                        <button class="btn btn-small btn-success" onclick="pagarTotal(${conta.filho_id})">
                            <i class="fas fa-check"></i> Pagar Total
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
        document.getElementById('contas-table').innerHTML = 
            '<tr><td colspan="3" style="text-align: center; color: #dc3545;">Erro ao carregar contas.</td></tr>';
    }
}

async function carregarVendas() {
    try {
        const { data, error } = await supabaseClient
            .from('vendas')
            .select(`
                *,
                perfis_vendedor:vendedor_id (
                    nome,
                    email
                ),
                perfis_filho:filho_id (
                    nome,
                    email
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const tbody = document.getElementById('vendas-table');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhuma venda registrada.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(venda => {
            const dataVenda = new Date(venda.created_at).toLocaleDateString('pt-BR');
            const vendedor = venda.perfis_vendedor?.nome || venda.perfis_vendedor?.email || 'N/A';
            const filho = venda.filho_id ? (venda.perfis_filho?.nome || venda.perfis_filho?.email || 'N/A') : '-';
            const formaPagamento = {
                'pix': 'PIX',
                'dinheiro': 'Dinheiro',
                'anotar': 'Anotado na Conta'
            }[venda.forma_pagamento] || venda.forma_pagamento;

            return `
                <tr>
                    <td>${dataVenda}</td>
                    <td>R$ ${parseFloat(venda.total).toFixed(2).replace('.', ',')}</td>
                    <td>${formaPagamento}</td>
                    <td>${filho}</td>
                    <td>${vendedor}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        document.getElementById('vendas-table').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: #dc3545;">Erro ao carregar vendas.</td></tr>';
    }
}

function abrirModalAbater(filhoId, valorAtual) {
    document.getElementById('conta-filho-id').value = filhoId;
    document.getElementById('valor-abater').max = valorAtual;
    document.getElementById('modal-abater').style.display = 'flex';
}

async function abaterValor() {
    const filhoId = document.getElementById('conta-filho-id').value;
    const valorAbater = parseFloat(document.getElementById('valor-abater').value);
    const alertContainer = document.getElementById('alert-container');

    try {
        const { data: conta, error: errorConta } = await supabaseClient
            .from('contas_filhos')
            .select('valor')
            .eq('filho_id', filhoId)
            .single();

        if (errorConta) throw errorConta;

        const novoValor = Math.max(0, parseFloat(conta.valor) - valorAbater);

        const { error } = await supabaseClient
            .from('contas_filhos')
            .update({ valor: novoValor })
            .eq('filho_id', filhoId);

        if (error) throw error;

        alertContainer.innerHTML = '<div class="alert alert-success">Valor abatido com sucesso!</div>';
        setTimeout(() => {
            fecharModalAbater();
            carregarContas();
            carregarEstatisticas();
        }, 1000);
    } catch (error) {
        console.error('Erro ao abater valor:', error);
        alertContainer.innerHTML = `<div class="alert alert-error">Erro ao abater valor: ${error.message}</div>`;
    }
}

async function pagarTotal(filhoId) {
    if (!confirm('Tem certeza que deseja marcar esta conta como paga?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('contas_filhos')
            .update({ valor: 0 })
            .eq('filho_id', filhoId);

        if (error) throw error;

        alert('Conta paga com sucesso!');
        carregarContas();
        carregarEstatisticas();
    } catch (error) {
        console.error('Erro ao pagar conta:', error);
        alert('Erro ao pagar conta: ' + error.message);
    }
}

function fecharModalAbater() {
    document.getElementById('modal-abater').style.display = 'none';
    document.getElementById('abater-form').reset();
}
