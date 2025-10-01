// Utiliza localStorage para armazenar usuários e saves
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}
function setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
}
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}
function showLogin() {
    document.getElementById('login-container').style.display = '';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}
function showRegister() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = '';
    document.getElementById('dashboard').style.display = 'none';
}
function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('dashboard').style.display = '';
    document.getElementById('user-name').textContent = getCurrentUser();
    renderSaves();
}
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const users = getUsers();
    if (users[username] && users[username].password === password) {
        setCurrentUser(username);
        showDashboard();
        document.getElementById('login-error').textContent = '';
    } else {
        document.getElementById('login-error').textContent = 'Usuário ou senha inválidos.';
    }
}
function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const users = getUsers();
    if (!username || !password) {
        document.getElementById('register-error').textContent = 'Preencha todos os campos.';
        return;
    }
    if (users[username]) {
        document.getElementById('register-error').textContent = 'Usuário já existe.';
        return;
    }
    users[username] = { password, saves: [] };
    setUsers(users);
    setCurrentUser(username);
    showDashboard();
    document.getElementById('register-error').textContent = '';
}
function logout() {
    clearCurrentUser();
    showLogin();
}
function renderSaves() {
    const username = getCurrentUser();
    const users = getUsers();
    const saves = users[username]?.saves || [];
    const savesList = document.getElementById('saves-list');
    savesList.innerHTML = '';
    saves.forEach((save, idx) => {
        const li = document.createElement('li');
        li.textContent = save.name + ' (ID: ' + save.id + ')';
        li.classList.add('save-item');
        li.style.cursor = 'pointer';
        li.onclick = (e) => {
            // Evita conflito com botão de excluir
            if (e.target.tagName === 'BUTTON') return;
            openGameScreen(save);
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Excluir';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSave(idx);
        };
        li.appendChild(delBtn);
        savesList.appendChild(li);
    });
}

// Exibe a tela do jogo ao clicar em um save
function openGameScreen(save) {
    // Salva o save selecionado no localStorage
    localStorage.setItem('saveSelecionado', JSON.stringify(save));
    // Esconde todas as telas principais
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('start-menu').style.display = 'none';
    // Mostra a tela do jogo
    let gameScreen = document.getElementById('game-screen');
    gameScreen.style.display = '';
    preencherTelaJogo(save);
}

// --- LÓGICA DA TELA PRINCIPAL DO JOGO ---
function preencherTelaJogo(save) {
    // Dados fictícios para demonstração
    const jogador = JSON.parse(localStorage.getItem('jogador') || '{}');
    const time = jogador.time || 'Time';
    const logo = getLogoIcon(jogador.logo || 'logo1');
    const saldo = save.data.saldo || 15000000;
    const reputacao = save.data.reputacao || 60;
    const rodada = save.data.rodada || 1;
    const dataAtual = save.data.data || '01/01/2025';
    // Elenco fictício
    const elenco = save.data.elenco || gerarElencoFicticio();
    // Próximo jogo fictício
    const proximoJogo = save.data.proximoJogo || {
        adversario: 'Palmeiras',
        local: 'Casa',
        data: '08/01/2025'
    };
    // Confiança
    const confiancaBoard = save.data.confiancaBoard || 70;
    const confiancaFans = save.data.confiancaFans || 65;
    // Notícias
    const noticias = save.data.noticias || [
        'Mercado: Zagueiro Lucas vendido ao Porto.',
        'Meia João voltou de lesão.',
        'Atacante Pedro convocado para a seleção.'
    ];
    // Histórico de jogos
    const historico = save.data.historico || [
        { adversario: 'Vasco', resultado: 'V 2x1' },
        { adversario: 'Botafogo', resultado: 'E 1x1' },
        { adversario: 'Grêmio', resultado: 'D 0x2' },
        { adversario: 'Cruzeiro', resultado: 'V 3x0' },
        { adversario: 'Bahia', resultado: 'V 1x0' }
    ];
    // Notificações
    const notificacoes = save.data.notificacoes || [
        'Pedro foi convocado para a seleção!',
        'Contrato de João renovado.'
    ];

    // Cabeçalho
    document.getElementById('header-team-logo').textContent = logo;
    document.getElementById('header-team-name').textContent = time;
    document.getElementById('header-finance').textContent = 'R$ ' + saldo.toLocaleString('pt-BR');
    document.getElementById('header-reputation').textContent = 'Reputação: ' + reputacao;
    document.getElementById('header-date').textContent = dataAtual;
    document.getElementById('header-round').textContent = 'Rodada ' + rodada;

    // Menu principal: listeners
    document.getElementById('btn-menu-elenco').onclick = () => renderElenco(elenco);
    document.getElementById('btn-menu-treinos').onclick = () => renderTreinos();
    document.getElementById('btn-menu-proximojogo').onclick = () => renderProximoJogo(proximoJogo);
    document.getElementById('btn-menu-transferencias').onclick = () => renderTransferencias();
    document.getElementById('btn-menu-tatica').onclick = () => renderTatica();
    document.getElementById('btn-menu-opcoes').onclick = () => renderOpcoes();

    // Área central: elenco padrão
    renderElenco(elenco);

    // Lateral: próximo jogo
    document.getElementById('aside-next-match-info').innerHTML = `
        <b>Adversário:</b> ${proximoJogo.adversario}<br>
        <b>Local:</b> ${proximoJogo.local}<br>
        <b>Data:</b> ${proximoJogo.data}
    `;
    // Lateral: confiança
    document.getElementById('aside-confidence-board').textContent = confiancaBoard + '%';
    document.getElementById('aside-confidence-fans').textContent = confiancaFans + '%';
    // Lateral: notícias
    const newsList = document.getElementById('aside-news-list');
    newsList.innerHTML = '';
    noticias.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        newsList.appendChild(li);
    });
    // Lateral: gráfico elenco
    renderMiniGraficoElenco(elenco);
    // Lateral: histórico
    const histList = document.getElementById('aside-history-list');
    histList.innerHTML = '';
    historico.forEach(j => {
        const li = document.createElement('li');
        li.textContent = `${j.resultado} vs ${j.adversario}`;
        histList.appendChild(li);
    });
    // Lateral: notificações
    const notifList = document.getElementById('aside-notifications-list');
    notifList.innerHTML = '';
    notificacoes.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        notifList.appendChild(li);
    });
    // Botão avançar semana
    document.getElementById('btn-avancar-semana').onclick = () => avancarSemana(save);
}

function gerarElencoFicticio() {
    return [
        { nome: 'João', pos: 'GOL', idade: 28, energia: 95, status: 'Titular', valor: 4000000 },
        { nome: 'Carlos', pos: 'DEF', idade: 31, energia: 90, status: 'Titular', valor: 3500000 },
        { nome: 'Lucas', pos: 'DEF', idade: 25, energia: 88, status: 'Reserva', valor: 2000000 },
        { nome: 'Pedro', pos: 'MEI', idade: 23, energia: 92, status: 'Titular', valor: 5000000 },
        { nome: 'Rafael', pos: 'ATA', idade: 27, energia: 85, status: 'Titular', valor: 6000000 },
        { nome: 'Bruno', pos: 'ATA', idade: 21, energia: 80, status: 'Reserva', valor: 2500000 },
        { nome: 'André', pos: 'MEI', idade: 29, energia: 87, status: 'Reserva', valor: 1800000 },
        { nome: 'Felipe', pos: 'DEF', idade: 24, energia: 93, status: 'Titular', valor: 3200000 },
        { nome: 'Marcos', pos: 'GOL', idade: 34, energia: 78, status: 'Reserva', valor: 1000000 }
    ];
}

// Render elenco com filtros e ações rápidas
function renderElenco(elenco) {
    const center = document.getElementById('main-center');
    center.innerHTML = '';
    // Filtros
    const filtros = ['Todos', 'GOL', 'DEF', 'MEI', 'ATA'];
    const filtroBar = document.createElement('div');
    filtroBar.className = 'elenco-filtros';
    filtros.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'elenco-filtro-btn';
        btn.textContent = f;
        btn.onclick = () => renderElenco(elenco.filter(j => f === 'Todos' ? true : j.pos === f));
        filtroBar.appendChild(btn);
    });
    center.appendChild(filtroBar);
    // Tabela elenco
    const table = document.createElement('table');
    table.className = 'elenco-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Nome</th><th>Posição</th><th>Idade</th><th>Energia</th><th>Status</th><th>Valor</th><th>Ações</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    elenco.forEach(j => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${j.nome}</td>
            <td>${j.pos}</td>
            <td>${j.idade}</td>
            <td>${j.energia}</td>
            <td>${j.status}</td>
            <td>R$ ${j.valor.toLocaleString('pt-BR')}</td>
            <td>
                <button class="elenco-acao-btn">Escalar</button>
                <button class="elenco-acao-btn">Vender</button>
                <button class="elenco-acao-btn">Renovar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    center.appendChild(table);
}

function renderTreinos() {
    const center = document.getElementById('main-center');
    center.innerHTML = '<h3>Treinos</h3><p>Funcionalidade em desenvolvimento.</p>';
}
function renderProximoJogo(proximoJogo) {
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Próximo Jogo</h3>
        <b>Adversário:</b> ${proximoJogo.adversario}<br>
        <b>Local:</b> ${proximoJogo.local}<br>
        <b>Data:</b> ${proximoJogo.data}<br>
        <p>Em breve: escalação, análise do adversário, etc.</p>`;
}
function renderTransferencias() {
    const center = document.getElementById('main-center');
    center.innerHTML = '<h3>Transferências</h3><p>Funcionalidade em desenvolvimento.</p>';
}
function renderTatica() {
    const center = document.getElementById('main-center');
    center.innerHTML = '<h3>Tática</h3><p>Funcionalidade em desenvolvimento.</p>';
}
function renderOpcoes() {
    const center = document.getElementById('main-center');
    center.innerHTML = '<h3>Opções</h3><p>Funcionalidade em desenvolvimento.</p>';
}

function renderMiniGraficoElenco(elenco) {
    const bar = document.getElementById('aside-graph-bar');
    bar.innerHTML = '';
    const total = elenco.length;
    const posicoes = ['GOL','DEF','MEI','ATA'];
    posicoes.forEach(pos => {
        const qtd = elenco.filter(j => j.pos === pos).length;
        const pct = total ? Math.round((qtd/total)*100) : 0;
        const div = document.createElement('div');
        div.className = 'graph-bar-segment';
        div.style.width = pct + '%';
        div.title = pos + ': ' + qtd;
        div.textContent = pos + ' (' + qtd + ')';
        bar.appendChild(div);
    });
}

function avancarSemana(save) {
    // Exemplo: avança rodada, atualiza data, energia, histórico, saldo, etc.
    if (!save.data) save.data = {};
    save.data.rodada = (save.data.rodada || 1) + 1;
    save.data.data = proximaData(save.data.data || '01/01/2025');
    // Simula cansaço
    if (save.data.elenco) {
        save.data.elenco.forEach(j => j.energia = Math.max(60, j.energia - Math.floor(Math.random()*10)));
    }
    // Simula saldo
    save.data.saldo = (save.data.saldo || 15000000) + Math.floor(Math.random()*2000000-1000000);
    // Simula reputação
    save.data.reputacao = Math.max(0, Math.min(100, (save.data.reputacao || 60) + Math.floor(Math.random()*5-2)));
    // Simula histórico
    if (!save.data.historico) save.data.historico = [];
    save.data.historico.unshift({ adversario: 'Adversário X', resultado: ['V 2x1','E 1x1','D 0x1'][Math.floor(Math.random()*3)] });
    save.data.historico = save.data.historico.slice(0,5);
    // Simula notificações
    if (!save.data.notificacoes) save.data.notificacoes = [];
    save.data.notificacoes.unshift('Semana avançada!');
    // Salva e recarrega
    localStorage.setItem('saveSelecionado', JSON.stringify(save));
    preencherTelaJogo(save);
}

function proximaData(dataStr) {
    // Formato dd/mm/yyyy
    const [d,m,y] = dataStr.split('/').map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() + 7);
    return dt.toLocaleDateString('pt-BR');
}
function createSave() {
    // Evita múltiplos modais
    if (document.getElementById('modal-save-bg')) return;

    // Cria o fundo do modal
    const bg = document.createElement('div');
    bg.className = 'modal-save-bg';
    bg.id = 'modal-save-bg';

    // Cria o modal
    const modal = document.createElement('div');
    modal.className = 'modal-save';
    modal.innerHTML = `
        <h3>Novo Save</h3>
        <input type="text" id="save-name-input" maxlength="32" placeholder="Nome do save">
        <div class="modal-actions">
            <button class="btn-cancel" type="button">Cancelar</button>
            <button class="btn-create" type="button">Criar</button>
        </div>
    `;

    // Eventos dos botões
    modal.querySelector('.btn-cancel').onclick = () => document.body.removeChild(bg);
    modal.querySelector('.btn-create').onclick = () => {
        const name = modal.querySelector('#save-name-input').value.trim();
        if (!name) {
            modal.querySelector('#save-name-input').focus();
            modal.querySelector('#save-name-input').style.borderColor = '#e74c3c';
            return;
        }
        const username = getCurrentUser();
        const users = getUsers();
        const newSave = { id: Date.now(), name, data: {} };
        users[username].saves.push(newSave);
        setUsers(users);
        renderSaves();
        document.body.removeChild(bg);
    };
    // Enter para criar, Esc para cancelar
    modal.querySelector('#save-name-input').onkeydown = (e) => {
        if (e.key === 'Enter') modal.querySelector('.btn-create').click();
        if (e.key === 'Escape') modal.querySelector('.btn-cancel').click();
    };

    bg.appendChild(modal);
    document.body.appendChild(bg);
    modal.querySelector('#save-name-input').focus();
}
function deleteSave(idx) {
    const username = getCurrentUser();
    const users = getUsers();
    users[username].saves.splice(idx, 1);
    setUsers(users);
    renderSaves();
}
// Inicialização
window.onload = function() {
    if (getCurrentUser()) {
        showDashboard();
    } else {
        showLogin();
    }
};


// --- TELA INICIAL DE ESCOLHA DE TÉCNICO E TIME ---

// Exibe a tela de configuração inicial
function showStartMenu() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('start-menu').style.display = '';
    document.getElementById('coach-form').reset();
    document.getElementById('coach-error').style.display = 'none';
    document.getElementById('coach-summary').style.display = 'none';
    loadCoachFromStorage();
    updateCoachSummary();
}

// Exemplo de times e nacionalidades para expansão futura
const TEAMS = [
    'Flamengo','Palmeiras','Corinthians','São Paulo','Grêmio','Internacional','Atlético-MG','Santos','Vasco','Botafogo','Cruzeiro','Bahia','Fortaleza','Athletico-PR','Outros'
];
const NATIONS = [
    'Brasil','Argentina','Portugal','Espanha','Itália','França','Alemanha','Inglaterra','Uruguai','Outros'
];

// Atualiza o resumo em tempo real
function updateCoachSummary() {
    const name = document.getElementById('coach-name').value.trim();
    const nation = document.getElementById('coach-nation').value;
    const team = document.getElementById('coach-team').value;
    const avatar = document.getElementById('coach-avatar').value;
    const logo = document.getElementById('coach-logo').value;
    const tactic = document.getElementById('coach-tactic').value;
    const exp = document.getElementById('coach-exp').value;
    let html = '';
    if (name || nation || team) {
        html += `<b>Nome:</b> ${name || '<i>Não definido</i>'}<br>`;
        html += `<b>Avatar:</b> <span style='font-size:1.2em;'>${getAvatarIcon(avatar)}</span><br>`;
        html += `<b>Nacionalidade:</b> ${nation || '<i>Não definida</i>'}<br>`;
        html += `<b>Time:</b> ${team || '<i>Não definido</i>'}<br>`;
        html += `<b>Logo:</b> <span style='font-size:1.2em;'>${getLogoIcon(logo)}</span><br>`;
        html += `<b>Esquema:</b> ${tactic}<br>`;
        html += `<b>Experiência:</b> ${exp}`;
        document.getElementById('coach-summary').innerHTML = html;
        document.getElementById('coach-summary').style.display = '';
    } else {
        document.getElementById('coach-summary').style.display = 'none';
    }
}

function getAvatarIcon(val) {
    switch(val) {
        case 'avatar1': return '👨‍🦱';
        case 'avatar2': return '👨‍🦰';
        case 'avatar3': return '🧔';
        case 'avatar4': return '👩‍🦱';
        case 'avatar5': return '🧑‍🦲';
        default: return '👤';
    }
}
function getLogoIcon(val) {
    switch(val) {
        case 'logo1': return '🏆';
        case 'logo2': return '⚽';
        case 'logo3': return '🦁';
        case 'logo4': return '⭐';
        case 'logo5': return '🔥';
        default: return '🏅';
    }
}

// Validação dos campos
function validateCoachForm() {
    const name = document.getElementById('coach-name').value.trim();
    const nation = document.getElementById('coach-nation').value;
    const team = document.getElementById('coach-team').value;
    const avatar = document.getElementById('coach-avatar').value;
    const logo = document.getElementById('coach-logo').value;
    const tactic = document.getElementById('coach-tactic').value;
    const exp = document.getElementById('coach-exp').value;
    if (!name || !nation || !team || !avatar || !logo || !tactic || !exp) {
        showCoachError('Preencha todos os campos para continuar.');
        return false;
    }
    if (name.length < 3) {
        showCoachError('O nome do técnico deve ter pelo menos 3 caracteres.');
        return false;
    }
    return true;
}

function showCoachError(msg) {
    const el = document.getElementById('coach-error');
    el.textContent = msg;
    el.style.display = '';
}

function hideCoachError() {
    document.getElementById('coach-error').style.display = 'none';
}

// Salva dados do técnico no localStorage
function saveCoachToStorage() {
    const jogador = {
        nome: document.getElementById('coach-name').value.trim(),
        nacionalidade: document.getElementById('coach-nation').value,
        time: document.getElementById('coach-team').value,
        avatar: document.getElementById('coach-avatar').value,
        logo: document.getElementById('coach-logo').value,
        esquema: document.getElementById('coach-tactic').value,
        experiencia: document.getElementById('coach-exp').value
    };
    localStorage.setItem('jogador', JSON.stringify(jogador));
}

// Carrega dados do técnico do localStorage
function loadCoachFromStorage() {
    const data = localStorage.getItem('jogador');
    if (data) {
        try {
            const jogador = JSON.parse(data);
            document.getElementById('coach-name').value = jogador.nome || '';
            document.getElementById('coach-nation').value = jogador.nacionalidade || '';
            document.getElementById('coach-team').value = jogador.time || '';
            document.getElementById('coach-avatar').value = jogador.avatar || 'avatar1';
            document.getElementById('coach-logo').value = jogador.logo || 'logo1';
            document.getElementById('coach-tactic').value = jogador.esquema || '4-4-2';
            document.getElementById('coach-exp').value = jogador.experiencia || 'Iniciante';
        } catch {}
    }
}

// Efeito de transição suave (fade out/in)
function fadeOutIn(element, callback) {
    element.style.transition = 'opacity 0.5s';
    element.style.opacity = 0;
    setTimeout(() => {
        if (callback) callback();
        element.style.opacity = 1;
    }, 500);
}

// Evento de confirmação
function handleCoachConfirm() {
    if (!validateCoachForm()) return;
    saveCoachToStorage();
    hideCoachError();
    // Transição para próxima fase (exemplo: dashboard)
    const menu = document.getElementById('start-menu');
    fadeOutIn(menu, () => {
        menu.style.display = 'none';
        showDashboard();
    });
}

// Evento de carregar dados
function handleCoachLoad() {
    loadCoachFromStorage();
    updateCoachSummary();
    hideCoachError();
}

// Integração com fluxo do jogo: após criar um save, ir para tela inicial
const originalCreateSave = createSave;
createSave = function() {
    originalCreateSave();
    setTimeout(() => {
        showStartMenu();
    }, 300); // pequena espera para UX
};

// Permite acessar a tela inicial manualmente (para testes)
window.showStartMenu = showStartMenu;

// Listeners para inputs e botões
window.addEventListener('DOMContentLoaded', () => {
    const name = document.getElementById('coach-name');
    const nation = document.getElementById('coach-nation');
    const team = document.getElementById('coach-team');
    const avatar = document.getElementById('coach-avatar');
    const logo = document.getElementById('coach-logo');
    const tactic = document.getElementById('coach-tactic');
    const exp = document.getElementById('coach-exp');
    [name, nation, team, avatar, logo, tactic, exp].forEach(el => {
        if (el) el.addEventListener('input', updateCoachSummary);
        if (el) el.addEventListener('change', updateCoachSummary);
    });
    const btnConfirm = document.getElementById('btn-confirm');
    if (btnConfirm) btnConfirm.onclick = handleCoachConfirm;
    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) btnLoad.onclick = handleCoachLoad;
});

// Quando dashboard aparecer, NÃO forçar a tela de técnico/time (apenas após novo save)
