// ===============================
// CALENDÁRIO – EVENTOS
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    carregarCalendarioInterno();
});

async function carregarCalendarioInterno() {
    const container = document.getElementById('eventos-container');

    if (!container) {
        console.error('Container eventos-container não encontrado');
        return;
    }

    try {
        // Data de hoje LOCAL (sem UTC)
        const hoje = new Date();
        const dataHoje = hoje.toLocaleDateString('en-CA'); // YYYY-MM-DD

        console.log('Buscando eventos a partir de:', dataHoje);

        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .gte('data', dataHoje)
            .order('data', { ascending: true });

        if (error) throw error;

        console.log('Eventos retornados:', data);

        if (!data || data.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; color:#666;">
                    Nenhum evento agendado no momento.
                </p>`;
            return;
        }

        container.innerHTML = `
            <div class="eventos-grid">
                ${data.map(evento => `
                    <div class="evento-card evento-card--compact">
                        <h3>${evento.titulo}</h3>

                        <p class="evento-data">
                            <i class="fas fa-calendar"></i>
                            ${formatarData(evento.data)}
                            ${evento.horario ? `
                                <span style="margin-left: 15px;">
                                    <i class="fas fa-clock"></i>
                                    ${formatarHorario(evento.horario)}
                                </span>` : ''}
                        </p>

                        ${evento.descricao ? `
                            <p style="color:#666; margin-top:10px;">
                                ${evento.descricao}
                            </p>` : ''}

                        ${evento.local ? `
                            <p style="color:#666; margin-top:5px;">
                                <i class="fas fa-map-marker-alt"></i>
                                ${evento.local}
                            </p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        container.innerHTML = `
            <p style="text-align:center; color:#dc3545;">
                Erro ao carregar eventos.
            </p>`;
    }
}

// ===============================
// FORMATADORES
// ===============================

function formatarData(data) {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);

    return dataLocal.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatarHorario(horario) {
    return horario.substring(0, 5); // 14:00
}
