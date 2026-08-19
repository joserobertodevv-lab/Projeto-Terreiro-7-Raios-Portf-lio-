// Funções para gerenciar o calendário

async function carregarEventos() {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .gte('data', new Date().toISOString().split('T')[0])
            .order('data', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('eventos-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum evento agendado no momento.</p>';
            return;
        }

        container.innerHTML = `<div class="eventos-grid">` + data.map(evento => `
            <div class="evento-card evento-card--compact">
                <h3>${evento.titulo}</h3>
                <p class="evento-data">
                    <i class="fas fa-calendar"></i> ${formatarData(evento.data)}
                    ${evento.horario ? `<i class="fas fa-clock" style="margin-left: 15px;"></i> ${evento.horario}` : ''}
                </p>
                ${evento.descricao ? `<p style="color: #666; margin-top: 10px;">${evento.descricao}</p>` : ''}
                ${evento.local ? `<p style="color: #666; margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>` : ''}
            </div>
        `).join('') + `</div>`;
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        document.getElementById('eventos-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Erro ao carregar eventos. Tente novamente mais tarde.</p>';
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
