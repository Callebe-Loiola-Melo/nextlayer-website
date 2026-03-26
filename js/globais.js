// js/globais.js
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');

    // ==========================================
    // MÁGICA: ESCONDER BARRA MOBILE QUANDO QUALQUER MODAL ABRIR
    // ==========================================
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        // Cria um observador que vigia se algum modal mudou de display:none para flex
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList.contains('modal-overlay')) {
                        if (target.style.display === 'flex' || target.style.display === 'block') {
                            // Se o modal abriu, esconde a barra mobile imediatamente
                            bottomNav.style.display = 'none'; 
                        } else {
                            // Se fechou, verifica se não tem outro modal aberto antes de mostrar a barra de novo
                            const algumAberto = Array.from(document.querySelectorAll('.modal-overlay'))
                                .some(m => m.style.display === 'flex' || m.style.display === 'block');
                            if (!algumAberto) {
                                bottomNav.style.display = ''; // Limpa o estilo embutido, voltando ao controle do CSS original
                            }
                        }
                    }
                }
            });
        });

        // Aplica o vigia em todos os modais da página
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    }
});

// ==========================================
// MODAL DE CONTATO
// ==========================================
const btnContatoHeader = document.getElementById('btn-contato-header');
const btnContatoMobile = document.getElementById('btn-contato-mobile'); 
const modalContato = document.getElementById('modal-contato');
const btnFecharModalContato = document.getElementById('btn-fechar-modal-contato');

// Função para fechar o modal com animação suave
function fecharModalSuave() {
    const content = modalContato.querySelector('.modal-content');
    content.classList.remove('anim-entrada');
    content.classList.add('anim-saida'); // Dispara a animação de saída
    
    setTimeout(() => {
        modalContato.style.display = 'none';
        content.classList.remove('anim-saida');
        content.classList.add('anim-entrada'); // Reseta pro próximo clique
        document.body.classList.remove('modal-aberto');
    }, 300); // Espera 300ms (tempo da animação)
}

// Função para abrir o modal
function abrirModal(e) {
    if(e) e.preventDefault();
    modalContato.style.display = 'flex';
    document.body.classList.add('modal-aberto'); 
}

// Ouvintes de Eventos
if (modalContato) {
    // Abrir Modal pelo botão do Header (Computador)
    if (btnContatoHeader) {
        btnContatoHeader.addEventListener('click', abrirModal);
    }
    
    // Abrir Modal pelo botão flutuante da Bottom Nav (Celular)
    if (btnContatoMobile) {
        btnContatoMobile.addEventListener('click', abrirModal);
    }

    // Fechar clicando no (X)
    if (btnFecharModalContato) {
        btnFecharModalContato.addEventListener('click', fecharModalSuave);
    }

    // Fechar clicando fora (no overlay escuro)
    modalContato.addEventListener('click', (e) => {
        if (e.target === modalContato) fecharModalSuave();
    });
}