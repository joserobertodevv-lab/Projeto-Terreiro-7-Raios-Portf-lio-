// Funções para gerenciar pontos dos Orixás

async function carregarPontosOrixas() {
    try {
        const { data, error } = await supabaseClient
            .from('pontos_orixas')
            .select('*')
            .order('orixa', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('orixas-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum ponto disponível no momento.</p>';
            return;
        }

        // Agrupar por Orixá
        const pontosPorOrixa = {};
        data.forEach(ponto => {
            if (!pontosPorOrixa[ponto.orixa]) {
                pontosPorOrixa[ponto.orixa] = [];
            }
            pontosPorOrixa[ponto.orixa].push(ponto);
        });

        container.innerHTML = Object.keys(pontosPorOrixa).map(orixa => `
            <div class="card" style="margin-bottom: 20px;">
                <h3 style="color: #78350F; margin-bottom: 15px;">${orixa}</h3>
                ${pontosPorOrixa[orixa].map(ponto => `
                    <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ffe5b4;">
                        <h4 style="color: #92400E; margin-bottom: 10px;">${ponto.titulo}</h4>
                        <p style="color: #666; white-space: pre-line; line-height: 1.8;">${ponto.letra || ''}</p>
                        ${ponto.autor ? `<p style="color: #999; font-size: 12px; margin-top: 5px;"><em>Autor: ${ponto.autor}</em></p>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar pontos:', error);
        document.getElementById('orixas-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545;">Erro ao carregar pontos. Tente novamente mais tarde.</p>';
    }
}
