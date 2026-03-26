import { supabase } from './supabase.js';

const formOrcamento = document.getElementById('form-orcamento');
const btnSubmit = document.getElementById('btn-submit');

if (formOrcamento) {
    formOrcamento.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const textoOriginal = btnSubmit.innerText;
        btnSubmit.innerText = 'Enviando...';
        btnSubmit.disabled = true;

        const nome = document.getElementById('nome').value;
        const empresa = document.getElementById('empresa').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const descricao_projeto = document.getElementById('descricao').value;

        try {
            // 1. SALVA NO BANCO (SUPABASE)
            const { error } = await supabase
                .from('orcamentos')
                .insert([{ nome, empresa, email, telefone, descricao_projeto }]);

            if (error) throw error; 

            // 2. DISPARA O E-MAIL (EMAILJS)
            try {
                if (typeof emailjs !== 'undefined') {
                    emailjs.init("fC5lN8LU8ZWy5koQl");
                    await emailjs.send("service_ry6ghjt", "template_za1amoj", {
                        nome: nome,
                        empresa: empresa || 'Não informada',
                        email: email,
                        telefone: telefone,
                        descricao: descricao_projeto
                    });
                }
            } catch (emailError) {
                console.error("Erro oculto no e-mail:", emailError);
            }

            // ==========================================
            // 3. A MÁGICA DO MODAL DE 10 SEGUNDOS
            // ==========================================
            const modalSucesso = document.getElementById('modal-sucesso');
            const spanSegundos = document.getElementById('segundos-restantes');
            const btnFecharSucesso = document.getElementById('btn-fechar-sucesso');
            const countdownContainer = document.getElementById('countdown-container');

            if (modalSucesso) {
                // Abre o modal e trava a tela
                modalSucesso.style.display = 'flex';
                document.body.classList.add('modal-aberto');

                // Reseta o estado (caso o cara mande 2 orçamentos)
                btnFecharSucesso.style.display = 'none';
                countdownContainer.style.display = 'block';
                let segundos = 10; // Tempo do bloqueio
                spanSegundos.innerText = segundos;

                // Inicia a contagem regressiva
                const intervalo = setInterval(() => {
                    segundos--;
                    spanSegundos.innerText = segundos;
                    
                    if (segundos <= 0) {
                        // Quando zera: Para o relógio, esconde a caixa azul e mostra o botão
                        clearInterval(intervalo);
                        countdownContainer.style.display = 'none';
                        btnFecharSucesso.style.display = 'block';
                    }
                }, 1000);

                // Quando o usuário finalmente clicar em fechar
                btnFecharSucesso.onclick = () => {
                    modalSucesso.style.display = 'none';
                    document.body.classList.remove('modal-aberto');
                };
            }

            // Limpa o formulário
            formOrcamento.reset(); 

        } catch (error) {
            console.error("Erro ao enviar orçamento:", error);
            alert('Ops! Tivemos um problema de conexão. Tente novamente.');
        } finally {
            btnSubmit.innerText = textoOriginal;
            btnSubmit.disabled = false;
        }
    });
}