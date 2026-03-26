import { supabase } from './supabase.js';

// ==========================================
// 1. AUTENTICAÇÃO E NAVEGAÇÃO
// ==========================================
async function verificarAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) window.location.href = 'login.html';
}
verificarAuth();

// Lógica Adicionada para o Hamburger Menu do Mobile
document.addEventListener('DOMContentLoaded', () => {
    const btnHamburger = document.getElementById('btn-hamburger');
    const sidebar = document.querySelector('.sidebar');
    
    if(btnHamburger && sidebar) {
        btnHamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const icon = btnHamburger.querySelector('i');
            if(sidebar.classList.contains('active')) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
            }
        });
        
        // Fechar a sidebar ao clicar em um link
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if(window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    btnHamburger.querySelector('i').classList.remove('fa-times');
                    btnHamburger.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

const navButtons = document.querySelectorAll('.nav-btn');
const secoes = document.querySelectorAll('.painel-secao');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        secoes.forEach(s => s.style.display = 'none');
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).style.display = 'block';
        
        if(btn.getAttribute('data-target') === 'secao-metricas') carregarMetricasEGraficos();
        if(btn.getAttribute('data-target') === 'secao-projetos') carregarListaProjetosAdmin();
        if(btn.getAttribute('data-target') === 'secao-home') carregarStatsAdmin();
    });
});

// ==========================================
// FUNÇÃO GLOBAL: UPLOAD DE IMAGEM
// ==========================================
async function fazerUploadImagem(file) {
    const extensao = file.name.split('.').pop();
    const nomeUnico = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extensao}`;
    const { data, error } = await supabase.storage.from('portfolio').upload(nomeUnico, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(nomeUnico);
    return urlData.publicUrl;
}

// ==========================================
// 2. SISTEMA DE ORÇAMENTOS (Tabela e Modal)
// ==========================================
let todosOrcamentos = [];

function getClasseStatus(status) {
    if (status === 'Em Produção') return 'status-producao';
    if (status === 'Finalizado') return 'status-finalizado';
    return 'status-pendente';
}

async function carregarOrcamentos() {
    try {
        const { data, error } = await supabase.from('orcamentos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        todosOrcamentos = data;
        renderizarTabela(data);
    } catch (error) { console.error(error); }
}

function renderizarTabela(dados) {
    const tbody = document.getElementById('tabela-orcamentos-body');
    tbody.innerHTML = '';
    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum pedido encontrado.</td></tr>';
        return;
    }

    dados.forEach(pedido => {
        const dataF = new Date(pedido.created_at).toLocaleDateString('pt-BR');
        let statusTexto = pedido.status;
        if (!statusTexto || statusTexto === 'Novo') statusTexto = 'Pendente';
        const classeStatus = getClasseStatus(statusTexto);
        
        const tr = document.createElement('tr');
        // ATENÇÃO: Adicionei os data-labels aqui, é o que faz a mágica no mobile!
        tr.innerHTML = `
            <td data-label="Data">${dataF}</td>
            <td data-label="Nome"><strong>${pedido.nome}</strong></td>
            <td data-label="Empresa">${pedido.empresa || '-'}</td>
            <td data-label="Telefone"><a href="https://wa.me/55${pedido.telefone.replace(/\D/g,'')}" target="_blank" style="color:#38BDF8;">${pedido.telefone}</a></td>
            <td data-label="Status"><span class="badge-status ${classeStatus}">${statusTexto}</span></td>
            <td data-label="Ações"><button class="btn btn-primary btn-sm btn-ver-detalhes" data-id="${pedido.id}">Detalhes</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pedido = todosOrcamentos.find(p => p.id === e.target.getAttribute('data-id'));
            abrirModalOrcamento(pedido);
        });
    });
}

// Filtro de Data
document.getElementById('busca-data').addEventListener('change', (e) => {
    if(!e.target.value) return renderizarTabela(todosOrcamentos);
    renderizarTabela(todosOrcamentos.filter(p => p.created_at.split('T')[0] === e.target.value));
});
document.getElementById('btn-limpar-busca').addEventListener('click', () => {
    document.getElementById('busca-data').value = ''; renderizarTabela(todosOrcamentos);
});

// Modal Orçamento
const modalOrcamento = document.getElementById('modal-orcamento');

function abrirModalOrcamento(pedido) {
    let statusTexto = pedido.status;
    if (!statusTexto || statusTexto === 'Novo') statusTexto = 'Pendente';
    
    const badge = document.getElementById('modal-badge-status');
    document.getElementById('modal-id-pedido').value = pedido.id;
    document.getElementById('modal-nome').innerText = pedido.nome;
    document.getElementById('modal-data').innerText = new Date(pedido.created_at).toLocaleString('pt-BR');
    document.getElementById('modal-empresa').innerText = pedido.empresa || 'Não informada';
    document.getElementById('modal-telefone').innerText = pedido.telefone;
    document.getElementById('modal-email').innerText = pedido.email;
    document.getElementById('modal-desc-texto').innerText = pedido.descricao_projeto;
    document.getElementById('modal-status').value = statusTexto;
    document.getElementById('modal-dev').value = pedido.dev_responsavel || '';
    badge.innerText = statusTexto;
    badge.className = `badge-status ${getClasseStatus(statusTexto)}`;
    modalOrcamento.style.display = 'flex';
}

document.getElementById('btn-fechar-modal').addEventListener('click', () => modalOrcamento.style.display = 'none');

document.getElementById('btn-salvar-modal').addEventListener('click', async (e) => {
    const btn = e.target; btn.innerText = 'Salvando...';
    try {
        await supabase.from('orcamentos').update({ 
            status: document.getElementById('modal-status').value, 
            dev_responsavel: document.getElementById('modal-dev').value 
        }).eq('id', document.getElementById('modal-id-pedido').value);
        modalOrcamento.style.display = 'none';
        carregarOrcamentos();
    } catch (e) { alert('Erro ao salvar!'); } 
    btn.innerText = 'Salvar Alterações';
});

document.getElementById('btn-excluir-pedido').addEventListener('click', async () => {
    if(confirm('Excluir este orçamento definitivamente?')) {
        await supabase.from('orcamentos').delete().eq('id', document.getElementById('modal-id-pedido').value);
        modalOrcamento.style.display = 'none'; carregarOrcamentos();
    }
});

carregarOrcamentos();

// ==========================================
// 3. ESTATÍSTICAS DA HOME
// ==========================================
async function carregarStatsAdmin() {
    try {
        const { data } = await supabase.from('configuracoes_home').select('*').eq('id', 1).single();
        if(data) {
            document.getElementById('stat-entregues').value = data.projetos_entregues;
            document.getElementById('stat-satisfacao-input').value = data.satisfacao;
            document.getElementById('stat-anos-input').value = data.anos_experiencia;
            document.getElementById('show-entregues').innerText = data.projetos_entregues;
            document.getElementById('show-satisfacao').innerText = data.satisfacao + '%';
            document.getElementById('show-anos').innerText = data.anos_experiencia;
        }
    } catch (e) {}
}
document.getElementById('form-stats').addEventListener('submit', async (e) => {
    e.preventDefault(); e.submitter.innerText = 'Atualizando...';
    await supabase.from('configuracoes_home').update({
        projetos_entregues: document.getElementById('stat-entregues').value,
        satisfacao: document.getElementById('stat-satisfacao-input').value,
        anos_experiencia: document.getElementById('stat-anos-input').value
    }).eq('id', 1);
    e.submitter.innerText = 'Atualizar Estatísticas'; carregarStatsAdmin();
});

// ==========================================
// 4. PORTFÓLIO: ADICIONAR E EDITAR
// ==========================================
let todosProjetos = [];

async function carregarListaProjetosAdmin() {
    const divLista = document.getElementById('lista-projetos-admin');
    try {
        const { data } = await supabase.from('projetos').select('*').order('created_at', { ascending: false });
        todosProjetos = data;
        divLista.innerHTML = '';
        data.forEach(p => {
            divLista.innerHTML += `
                <div class="mini-projeto item-projeto-admin" onclick="abrirModalEdicaoProjeto('${p.id}')">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${p.imagem_url}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                        <strong>${p.titulo}</strong>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); deletarProjeto('${p.id}')" style="color: #ef4444; border-color: transparent;">Excluir</button>
                </div>
            `;
        });
    } catch (e) {}
}

// ADICIONAR NOVO PROJETO (COM UPLOAD E PREVIEW)
document.getElementById('proj-imagem').addEventListener('change', function(e) {
    if(e.target.files.length > 0) {
        alert("Imagem selecionada. Clique em Salvar e Publicar para fazer o upload.");
    }
});

document.getElementById('form-novo-projeto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-novo-projeto');
    btn.innerText = 'Fazendo Upload...'; btn.disabled = true;
    
    try {
        const fileInput = document.getElementById('proj-imagem');
        if (fileInput.files.length === 0) throw new Error("Por favor, selecione uma imagem.");
        
        const imagemFile = fileInput.files[0];
        const urlImagem = await fazerUploadImagem(imagemFile);

        await supabase.from('projetos').insert([{
            titulo: document.getElementById('proj-titulo').value,
            descricao: document.getElementById('proj-descricao').value,
            linguagens: document.getElementById('proj-linguagens').value,
            link_projeto: document.getElementById('proj-link').value,
            imagem_url: urlImagem
        }]);

        alert('Projeto publicado com foto!');
        document.getElementById('form-novo-projeto').reset();
        carregarListaProjetosAdmin();
    } catch(e) { alert('Erro ao salvar projeto.'); console.error(e); }
    btn.innerText = 'Salvar e Publicar'; btn.disabled = false;
});

// EDITAR PROJETO (COM PREVIEW DE IMAGEM NOVA)
const modalEditProj = document.getElementById('modal-editar-projeto');

// Adiciona o evento de preview no modal de edição
document.getElementById('edit-proj-imagem').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        // Cria um link provisório local para a foto nova aparecer no preview
        document.getElementById('edit-proj-preview').src = URL.createObjectURL(file);
    }
});

window.abrirModalEdicaoProjeto = function(id) {
    const proj = todosProjetos.find(p => p.id === id);
    document.getElementById('edit-proj-id').value = proj.id;
    document.getElementById('edit-proj-titulo').value = proj.titulo;
    document.getElementById('edit-proj-descricao').value = proj.descricao;
    document.getElementById('edit-proj-linguagens').value = proj.linguagens;
    document.getElementById('edit-proj-link').value = proj.link_projeto;
    
    document.getElementById('edit-proj-preview').src = proj.imagem_url;
    document.getElementById('edit-proj-imagem').value = ''; 
    
    modalEditProj.style.display = 'flex';
}

document.getElementById('btn-cancelar-edit').addEventListener('click', () => modalEditProj.style.display = 'none');
document.getElementById('btn-fechar-modal-proj').addEventListener('click', () => modalEditProj.style.display = 'none');

document.getElementById('btn-salvar-edicao-proj').addEventListener('click', async () => {
    const id = document.getElementById('edit-proj-id').value;
    const btn = document.getElementById('btn-salvar-edicao-proj');
    btn.innerText = 'Salvando...'; btn.disabled = true;

    try {
        let urlImagem = todosProjetos.find(p => p.id === id).imagem_url;
        const fileInput = document.getElementById('edit-proj-imagem');
        
        if (fileInput.files.length > 0) {
            btn.innerText = 'Subindo Imagem...';
            urlImagem = await fazerUploadImagem(fileInput.files[0]);
        }

        await supabase.from('projetos').update({
            titulo: document.getElementById('edit-proj-titulo').value,
            descricao: document.getElementById('edit-proj-descricao').value,
            linguagens: document.getElementById('edit-proj-linguagens').value,
            link_projeto: document.getElementById('edit-proj-link').value,
            imagem_url: urlImagem
        }).eq('id', id);

        modalEditProj.style.display = 'none';
        carregarListaProjetosAdmin();
    } catch(e) { alert('Erro ao editar.'); }
    
    btn.innerText = 'Salvar Edição'; btn.disabled = false;
});

window.deletarProjeto = async function(id) {
    if(confirm('Excluir este projeto do catálogo?')) {
        await supabase.from('projetos').delete().eq('id', id);
        carregarListaProjetosAdmin();
    }
}

// ==========================================
// 5. MÉTRICAS E GRÁFICOS (CHART.JS - PIZZA ÚNICA)
// ==========================================
let chartPizza = null;

async function carregarMetricasEGraficos() {
    try {
        // Pega todos os projetos pra garantir que as métricas superiores estejam certas
        if(todosProjetos.length === 0) await carregarListaProjetosAdmin();
        if(todosOrcamentos.length === 0) await carregarOrcamentos();

        const totalProjetos = todosProjetos.length;
        document.getElementById('metrica-projetos').innerText = totalProjetos;
        document.getElementById('metrica-pedidos').innerText = todosOrcamentos.length;

        // --- Lógica do Gráfico de Pizza (Status + Portfólio) ---
        let pendente = 0, producao = 0, finalizado = 0;
        
        todosOrcamentos.forEach(p => {
            let s = p.status;
            if(!s || s === 'Novo' || s === 'Pendente') pendente++;
            else if(s === 'Em Produção') producao++;
            else if(s === 'Finalizado') finalizado++;
        });

        const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
        if(chartPizza) chartPizza.destroy(); 
        
        chartPizza = new Chart(ctxPizza, {
            type: 'doughnut',
            data: {
                // Adicionamos 'Portfólio' como a 4ª categoria
                labels: ['Pendente', 'Em Produção', 'Finalizado', 'Portfólio'],
                datasets: [{
                    // Adicionamos a contagem de projetos na 4ª posição
                    data: [pendente, producao, finalizado, totalProjetos],
                    // Cores: Vermelho, Amarelo, Verde, e Azul (Para o Portfólio)
                    backgroundColor: ['#ef4444', '#eab308', '#22c55e', '#3b82f6'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: true,
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { color: '#fff', padding: 20, font: { size: 13 } } 
                    } 
                },
                cutout: '65%' // Deixa o buraco da pizza um pouco mais fino e elegante
            }
        });

    } catch (error) { console.error("Erro nos gráficos:", error); }
}