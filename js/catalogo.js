import { supabase } from './supabase.js';

const gridProjetos = document.getElementById('grid-projetos');
const modalProjeto = document.getElementById('modal-projeto');
let todosProjetosData = []; // Guardamos na memória para abrir no modal

async function carregarProjetos() {
    try {
        const { data: projetos, error } = await supabase
            .from('projetos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        todosProjetosData = projetos; // Salva na memória
        gridProjetos.innerHTML = '';

        if (projetos.length === 0) {
            gridProjetos.innerHTML = '<p style="text-align: center; color: #9CA3AF; grid-column: 1 / -1;">Nenhum projeto cadastrado ainda.</p>';
            return;
        }

        projetos.forEach(projeto => {
            const linguagensArray = projeto.linguagens ? projeto.linguagens.split(',') : [];
            let tagsHTML = '';
            linguagensArray.forEach(lang => {
                if (lang.trim() !== '') tagsHTML += `<span>${lang.trim()}</span>`;
            });

            const card = document.createElement('div');
            card.className = 'projeto-card';
            
            // O HTML DO CARD COM OS DOIS BOTÕES
            card.innerHTML = `
                <img src="${projeto.imagem_url || 'https://via.placeholder.com/600x400/0B101E/1D4ED8?text=Next+Layer'}" alt="${projeto.titulo}" class="projeto-img">
                <div class="projeto-info">
                    <h3>${projeto.titulo}</h3>
                    <p class="descricao-clamp">${projeto.descricao}</p>
                    <div class="projeto-tags">
                        ${tagsHTML}
                    </div>
                    
                    <div class="botoes-card">
                        <button class="btn btn-outline btn-abrir-modal" data-id="${projeto.id}">Detalhes</button>
                        <a href="${projeto.link_projeto}" target="_blank" class="btn btn-primary">Ver Projeto</a>
                    </div>
                </div>
            `;
            gridProjetos.appendChild(card);
        });

        // Adiciona evento de clique apenas aos botões de "Detalhes"
        document.querySelectorAll('.btn-abrir-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const proj = todosProjetosData.find(p => p.id === id);
                abrirModal(proj);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        gridProjetos.innerHTML = '<p style="text-align: center; color: #ef4444; grid-column: 1 / -1;">Erro ao carregar o portfólio.</p>';
    }
}

function abrirModal(projeto) {
    // Preenche os dados no modal
    document.getElementById('modal-proj-titulo').innerText = projeto.titulo;
    document.getElementById('modal-proj-img').src = projeto.imagem_url || 'https://via.placeholder.com/600x400/0B101E/1D4ED8?text=Next+Layer';
    document.getElementById('modal-proj-desc').innerText = projeto.descricao;
    document.getElementById('modal-proj-link').href = projeto.link_projeto;
    
    // Monta as tags no modal
    const linguagensArray = projeto.linguagens ? projeto.linguagens.split(',') : [];
    document.getElementById('modal-proj-tags').innerHTML = linguagensArray.map(lang => {
        return lang.trim() !== '' ? `<span>${lang.trim()}</span>` : '';
    }).join('');

    // Mostra o Modal e trava o fundo
    modalProjeto.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fechar o Modal no botão (X)
document.getElementById('btn-fechar-modal-proj').addEventListener('click', () => {
    modalProjeto.style.display = 'none';
    document.body.style.overflow = '';
});

// Fechar o Modal clicando fora da caixa escura (Fundo)
modalProjeto.addEventListener('click', (e) => {
    if(e.target === modalProjeto) {
        modalProjeto.style.display = 'none';
        document.body.style.overflow = '';
    }
});

carregarProjetos();