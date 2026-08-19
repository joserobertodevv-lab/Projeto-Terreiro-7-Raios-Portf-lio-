// Funções para gerenciar palestras

async function carregarPalestras() {
    try {
        const { data, error } = await supabaseClient
            .from('palestras')
            .select('*')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('palestras-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">Nenhuma palestra disponível no momento.</p>';
            return;
        }

        container.innerHTML = data.map(palestra => `
            <div class="card">
                <i data-lucide="video"></i>
                <h3>${palestra.titulo}</h3>
                <p>${palestra.descricao || ''}</p>
                ${palestra.url_video ? `
                    <a href="${palestra.url_video}" target="_blank">
                        <button><i class="fas fa-play"></i> Assistir</button>
                    </a>
                ` : ''}
            </div>
        `).join('');

        // Recriar ícones Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Erro ao carregar palestras:', error);
        document.getElementById('palestras-container').innerHTML = 
            '<p style="text-align: center; color: #dc3545; grid-column: 1 / -1;">Erro ao carregar palestras. Tente novamente mais tarde.</p>';
    }
}
