// Funções para gerenciar dashboard interno

async function carregarEventosDashboard() {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .order('data', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('eventos-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum evento cadastrado.</p>';
            return;
        }

        container.innerHTML = data.map(evento => `
            <div class="evento-card">
                <h3>${evento.titulo}</h3>
                <p class="evento-data">
                    <i class="fas fa-calendar"></i> ${formatarData(evento.data)}
                    ${evento.horario ? `<i class="fas fa-clock" style="margin-left: 15px;"></i> ${evento.horario}` : ''}
                </p>
                ${evento.local ? `<p style="color: #666; margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>` : ''}
                ${evento.descricao ? `<p style="color: #666; margin-top: 10px;">${evento.descricao}</p>` : ''}
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-small btn-marrom" onclick="editarEvento(${evento.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="excluirEvento(${evento.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        document.getElementById('eventos-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Erro ao carregar eventos. Tente novamente mais tarde.</p>';
    }
}

async function salvarEvento() {
    const id = document.getElementById('evento-id').value;
    const evento = {
        titulo: document.getElementById('evento-titulo').value,
        data: document.getElementById('evento-data').value,
        horario: document.getElementById('evento-horario').value || null,
        local: document.getElementById('evento-local').value || null,
        descricao: document.getElementById('evento-descricao').value || null
    };

    try {
        let result;
        if (id) {
            // Atualizar
            const { data, error } = await supabaseClient
                .from('eventos')
                .update(evento)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            result = data[0];
        } else {
            // Criar
            const { data, error } = await supabaseClient
                .from('eventos')
                .insert([evento])
                .select();
            
            if (error) throw error;
            result = data[0];
        }

        mostrarAlerta('Evento salvo com sucesso!', 'success');
        document.getElementById('formulario-container').style.display = 'none';
        carregarEventosDashboard();
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        mostrarAlerta('Erro ao salvar evento: ' + error.message, 'error');
    }
}

async function editarEvento(id) {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('evento-id').value = data.id;
        document.getElementById('evento-titulo').value = data.titulo;
        document.getElementById('evento-data').value = data.data;
        document.getElementById('evento-horario').value = data.horario || '';
        document.getElementById('evento-local').value = data.local || '';
        document.getElementById('evento-descricao').value = data.descricao || '';
        document.getElementById('form-titulo').textContent = 'Editar Evento';
        document.getElementById('formulario-container').style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar evento:', error);
        mostrarAlerta('Erro ao carregar evento para edição', 'error');
    }
}

async function excluirEvento(id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('eventos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarAlerta('Evento excluído com sucesso!', 'success');
        carregarEventosDashboard();
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        mostrarAlerta('Erro ao excluir evento: ' + error.message, 'error');
    }
}

function formatarData(data) {
    // Evita o bug de “voltar 1 dia” por causa de UTC (YYYY-MM-DD vira UTC)
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data)) {
        const [y, m, d] = data.split('T')[0].split('-').map(n => parseInt(n, 10));
        const dateLocal = new Date(y, m - 1, d);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return dateLocal.toLocaleDateString('pt-BR', options);
    }
    const date = new Date(data);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById('alert-container');
    const alertClass = tipo === 'success' ? 'alert-success' : 'alert-error';
    container.innerHTML = `<div class="alert ${alertClass}">${mensagem}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}
