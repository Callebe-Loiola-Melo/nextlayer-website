import { supabase } from './supabase.js';

const formLogin = document.getElementById('form-login');
const btnSubmit = document.getElementById('btn-submit');
const msgErro = document.getElementById('msg-erro');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Estado de carregamento
    const textoOriginal = btnSubmit.innerText;
    btnSubmit.innerText = 'Autenticando...';
    btnSubmit.disabled = true;
    msgErro.style.display = 'none';

    // Pega os dados
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Tenta fazer o login no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha,
        });

        if (error) {
            throw error;
        }

        // Se o login deu certo, redireciona para o Dashboard (index.html do painel)
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro no login:", error.message);
        // Exibe a mensagem de erro na tela
        msgErro.style.display = 'block';
        msgErro.innerText = 'E-mail ou senha incorretos.';
    } finally {
        // Volta o botão ao normal se der erro
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    }
});