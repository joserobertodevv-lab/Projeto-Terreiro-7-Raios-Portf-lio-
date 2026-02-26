// Funções para gerenciar pontos internos

async function carregarPontosInternos() {
    try {
        const { data, error } = await supabaseClient
            .from('pontos_internos')
            .select('*')
            .order('categoria', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('pontos-internos-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum ponto interno disponível no momento.</p>';
            return;
        }

        // Agrupar por categoria
        const pontosPorCategoria = {};
        data.forEach(ponto => {
            if (!pontosPorCategoria[ponto.categoria]) {
                pontosPorCategoria[ponto.categoria] = [];
            }
            pontosPorCategoria[ponto.categoria].push(ponto);
        });

        container.innerHTML = Object.keys(pontosPorCategoria).map(categoria => `
            <div class="card" style="margin-bottom: 20px;">
                <h3 style="color: #78350F; margin-bottom: 15px;">${categoria}</h3>
                ${pontosPorCategoria[categoria].map(ponto => `
                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ffe5b4;">
                        <h4 style="color: #92400E; margin-bottom: 10px;">${ponto.titulo}</h4>
                        <p style="color: #666; white-space: pre-line; line-height: 1.8;">${ponto.letra || ''}</p>
                        ${ponto.observacoes ? `<p style="color: #999; font-size: 12px; margin-top: 5px; font-style: italic;">${ponto.observacoes}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar pontos internos:', error);
        document.getElementById('pontos-internos-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Erro ao carregar pontos. Tente novamente mais tarde.</p>';
    }
}
