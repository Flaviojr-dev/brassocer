// --- EXTRAS CRIATIVOS: Histórico, Moral, Lesões, Artilharia, Premiações ---
function atualizarMoralEArtilharia(camp) {
    // Moral: jogadores que não jogam caem moral
    camp.times.forEach(time => {
        time.jogadores.forEach((j, idx) => {
            if (idx < 5) j.moral = Math.min(100, (j.moral||80)+2); // titulares
            else j.moral = Math.max(40, (j.moral||80)-3); // reservas
        });
    });
    // Artilharia
    let artilheiros = [];
    camp.times.forEach(time => {
        time.jogadores.forEach(j => {
            if (!j.gols) j.gols = 0;
            artilheiros.push({ nome: j.nome, time: time.nome, escudo: time.escudo, gols: j.gols });
        });
    });
    camp.artilharia = artilheiros.sort((a,b)=>b.gols-a.gols).slice(0,10);
}

function sortearLesoes(camp) {
    camp.times.forEach(time => {
        time.jogadores.forEach(j => {
            if (Math.random() < 0.02 && !j.lesionado) { // 2% de chance
                j.lesionado = true;
                j.semanasFora = Math.floor(Math.random()*3)+1;
            }
            if (j.lesionado) {
                j.semanasFora--;
                if (j.semanasFora <= 0) j.lesionado = false;
            }
        });
    });
}

function mostrarHistoricoMeuTime() {
    const camp = carregarCampeonato();
    const meu = camp.times[camp.meuTimeId];
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Histórico do ${meu.escudo} ${meu.nome}</h3>
        <ul style='list-style:none;padding:0;'>
            ${meu.historico.map(h=>`<li>Rodada ${h.rodada+1}: ${meu.escudo} ${meu.nome} ${h.g} x ${h.gc} ${h.adv}</li>`).join('')}
        </ul>
        <button class="elenco-acao-btn" id="btn-voltar-tabela">Voltar</button>`;
    document.getElementById('btn-voltar-tabela').onclick = () => {
        renderTabelaClassificacao(camp.times);
    };
}

function mostrarArtilharia() {
    const camp = carregarCampeonato();
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Artilharia</h3>
        <table class="elenco-table"><thead><tr><th>Jogador</th><th>Time</th><th>Gols</th></tr></thead><tbody>
            ${camp.artilharia.map(a=>`<tr><td>${a.nome}</td><td>${a.escudo} ${a.time}</td><td>${a.gols}</td></tr>`).join('')}
        </tbody></table>
        <button class="elenco-acao-btn" id="btn-voltar-tabela">Voltar</button>`;
    document.getElementById('btn-voltar-tabela').onclick = () => {
        renderTabelaClassificacao(camp.times);
    };
}

function mostrarPremiacoes() {
    const camp = carregarCampeonato();
    const tabela = atualizarClassificacao(camp.times);
    const campeao = tabela[0];
    const melhorDefesa = tabela.slice().sort((a,b)=>(a.golsContra)-(b.golsContra))[0];
    const artilheiro = camp.artilharia[0];
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Premiações da Temporada</h3>
        <div>🏆 Campeão: <b>${campeao.escudo} ${campeao.nome}</b></div>
        <div>🥅 Melhor Defesa: <b>${melhorDefesa.escudo} ${melhorDefesa.nome}</b> (${melhorDefesa.golsContra} gols sofridos)</div>
        <div>⚽ Artilheiro: <b>${artilheiro.nome}</b> (${artilheiro.gols} gols) - ${artilheiro.escudo} ${artilheiro.time}</div>
        <button class="elenco-acao-btn" id="btn-voltar-tabela">Voltar</button>`;
    document.getElementById('btn-voltar-tabela').onclick = () => {
        renderTabelaClassificacao(camp.times);
    };
}
// --- UI: Tabela de Classificação e Calendário ---
function renderTabelaClassificacao(times) {
    const center = document.getElementById('main-center');
    let tabela = atualizarClassificacao(times);
    center.innerHTML = `<h3>Tabela do Campeonato</h3>
        <table class=\"elenco-table\"><thead><tr><th>#</th><th>Time</th><th>Pts</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>GP</th><th>GC</th></tr></thead><tbody>
            ${tabela.map((t,i)=>`<tr${i===0?' style=\"background:rgba(0,166,80,0.08);font-weight:700;\"':''}><td>${i+1}</td><td>${t.escudo} ${t.nome}</td><td>${t.pontos}</td><td>${t.vitorias}</td><td>${t.empates}</td><td>${t.derrotas}</td><td>${t.saldo}</td><td>${t.golsPro}</td><td>${t.golsContra}</td></tr>`).join('')}
        </tbody></table>
        <button class=\"elenco-acao-btn\" id=\"btn-proxima-rodada\" style=\"margin-top:18px;\">Jogar Próxima Rodada</button>
        <button class=\"elenco-acao-btn\" id=\"btn-historico\" style=\"margin-top:8px;\">Histórico do Meu Time</button>
        <button class=\"elenco-acao-btn\" id=\"btn-artilharia\" style=\"margin-top:8px;\">Artilharia</button>
        <button class=\"elenco-acao-btn\" id=\"btn-premiacoes\" style=\"margin-top:8px;\">Premiações</button>
        <div id=\"calendario-campeonato\"></div>
    `;
    document.getElementById('btn-proxima-rodada').onclick = () => jogarProximaRodadaUI();
    document.getElementById('btn-historico').onclick = () => mostrarHistoricoMeuTime();
    document.getElementById('btn-artilharia').onclick = () => mostrarArtilharia();
    document.getElementById('btn-premiacoes').onclick = () => mostrarPremiacoes();
    renderCalendario();
}

function renderCalendario() {
    const camp = carregarCampeonato();
    if (!camp) return;
    const div = document.getElementById('calendario-campeonato');
    let html = `<h4>Calendário</h4><ul style='list-style:none;padding:0;'>`;
    camp.calendario.forEach((rod, i) => {
        html += `<li style='${i===camp.rodadaAtual?"font-weight:700;color:var(--gold);":i<camp.rodadaAtual?"color:#aaa;":""}'>Rodada ${i+1} ${i<camp.rodadaAtual?"✓":""}</li>`;
    });
    html += '</ul>';
    div.innerHTML = html;
}

function jogarProximaRodadaUI() {
    let camp = carregarCampeonato();
    if (!camp) camp = iniciarCampeonato();
    if (camp.rodadaAtual >= camp.calendario.length) {
        alert('Temporada encerrada!');
        mostrarPremiacoes();
        return;
    }
    sortearLesoes(camp);
    atualizarMoralEArtilharia(camp);
    // Descobre o jogo do usuário
    const rodada = camp.calendario[camp.rodadaAtual];
    let meuJogo = null;
    rodada.forEach(([idA, idB]) => {
        if (idA === camp.meuTimeId || idB === camp.meuTimeId) {
            meuJogo = { idA, idB };
        }
    });
    if (meuJogo) {
        // Simula os outros jogos
        let outrosResultados = [];
        rodada.forEach(([idA, idB]) => {
            if ((idA === meuJogo.idA && idB === meuJogo.idB)) return;
            const timeA = camp.times[idA];
            const timeB = camp.times[idB];
            let forcaA = timeA.jogadores.reduce((s, j) => s + j.energia, 0) + timeA.moral;
            let forcaB = timeB.jogadores.reduce((s, j) => s + j.energia, 0) + timeB.moral;
            let golA = Math.max(0, Math.round((Math.random() * 1.2 + 0.7) * forcaA / 1000 + Math.random()*2));
            let golB = Math.max(0, Math.round((Math.random() * 1.2 + 0.7) * forcaB / 1000 + Math.random()*2));
            timeA.golsPro += golA; timeA.golsContra += golB;
            timeB.golsPro += golB; timeB.golsContra += golA;
            timeA.saldo = timeA.golsPro - timeA.golsContra;
            timeB.saldo = timeB.golsPro - timeB.golsContra;
            if (golA > golB) { timeA.pontos += 3; timeA.vitorias++; timeB.derrotas++; }
            else if (golA < golB) { timeB.pontos += 3; timeB.vitorias++; timeA.derrotas++; }
            else { timeA.pontos++; timeB.pontos++; timeA.empates++; timeB.empates++; }
            timeA.historico.push({ adv: timeB.nome, g: golA, gc: golB, rodada: camp.rodadaAtual });
            timeB.historico.push({ adv: timeA.nome, g: golB, gc: golA, rodada: camp.rodadaAtual });
            outrosResultados.push({ timeA: timeA.nome, escudoA: timeA.escudo, golA, timeB: timeB.nome, escudoB: timeB.escudo, golB });
        });
        // Inicia o jogo ao vivo do usuário
        iniciarPartidaCampeonato(camp, meuJogo, outrosResultados);
    } else {
        // Não achou jogo do usuário, simula tudo
        const resultados = jogarRodada(camp);
        renderResultadosRodada(resultados, camp);
    }
}

// Inicia a tela de jogo ao vivo do campeonato
function iniciarPartidaCampeonato(camp, meuJogo, outrosResultados) {
    const meuTime = camp.times[meuJogo.idA === camp.meuTimeId ? meuJogo.idA : meuJogo.idB];
    const advTime = camp.times[meuJogo.idA === camp.meuTimeId ? meuJogo.idB : meuJogo.idA];
    // Estado da simulação
    simulacao = {
        tempo: 0,
        placarA: 0,
        placarB: 0,
        eventos: [],
        stats: {
            posseA: 50, posseB: 50,
            finalizA: 0, finalizB: 0,
            noGolA: 0, noGolB: 0,
            desarmesA: 0, desarmesB: 0,
            errosPasseA: 0, errosPasseB: 0
        },
        timeA: meuTime.nome,
        logoA: meuTime.escudo,
        timeB: advTime.nome,
        logoB: advTime.escudo,
        proximoJogo: { adversario: advTime.nome, local: 'Estádio', data: '' },
        intervalo: null,
        camp,
        meuTime,
        advTime,
        outrosResultados,
        taticas: ['4-4-2','4-3-3','3-5-2','4-5-1'],
        taticaAtual: '4-4-2',
        instrucao: 'Normal',
        substituicoes: [],
        podeSubstituir: 3
    };
    renderTelaAoVivoCampeonato();
    simulacao.intervalo = setInterval(atualizarTempoCampeonato, 700);
}

function renderTelaAoVivoCampeonato() {
    const s = simulacao;
    const c = document.getElementById('main-center');
    c.innerHTML = `
        <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div style="flex:2;min-width:260px;">
                <div class="live-header">
                    <span class="team-logo">${s.logoA}</span>
                    <span class="live-score" id="live-score">${s.placarA} x ${s.placarB}</span>
                    <span class="team-logo">${s.logoB}</span>
                </div>
                <div class="live-info">
                    <span id="live-time">${s.tempo}'</span> • Estádio
                </div>
                <div class="live-stats">
                    <div>Posse: <b id="stat-posse">${s.stats.posseA}% - ${s.stats.posseB}%</b></div>
                    <div>Finalizações: <b id="stat-finaliz">${s.stats.finalizA} - ${s.stats.finalizB}</b></div>
                    <div>No Gol: <b id="stat-nogol">${s.stats.noGolA} - ${s.stats.noGolB}</b></div>
                    <div>Desarmes: <b id="stat-desarmes">${s.stats.desarmesA} - ${s.stats.desarmesB}</b></div>
                    <div>Erros Passe: <b id="stat-erros">${s.stats.errosPasseA} - ${s.stats.errosPasseB}</b></div>
                </div>
                <div class="live-narracao" id="live-narracao" style="height:120px;overflow-y:auto;background:rgba(0,0,0,0.12);margin:18px 0 0 0;padding:10px 12px;border-radius:8px;font-size:1em;"></div>
            </div>
            <div style="flex:1;min-width:200px;max-width:320px;">
                <div class="aside-box" style="margin-bottom:12px;">
                    <h4>Gerenciar Time</h4>
                    <div><b>Tática:</b> <select id="select-tatica">${s.taticas.map(t=>`<option${t===s.taticaAtual?' selected':''}>${t}</option>`).join('')}</select></div>
                    <div style="margin:8px 0;"><b>Instrução:</b> <select id="select-instrucao">
                        <option${s.instrucao==='Normal'?' selected':''}>Normal</option>
                        <option${s.instrucao==='Atacar mais'?' selected':''}>Atacar mais</option>
                        <option${s.instrucao==='Segurar resultado'?' selected':''}>Segurar resultado</option>
                        <option${s.instrucao==='Pressionar alto'?' selected':''}>Pressionar alto</option>
                    </select></div>
                    <div style="margin:8px 0;"><b>Substituições (${s.podeSubstituir}):</b></div>
                    <div id="substituicoes-list"></div>
                </div>
            </div>
        </div>
    `;
    // Substituições
    renderSubstituicoes();
    document.getElementById('select-tatica').onchange = (e) => alterarTatica(e.target.value);
    document.getElementById('select-instrucao').onchange = (e) => alterarInstrucao(e.target.value);
}

function renderSubstituicoes() {
    const s = simulacao;
    const div = document.getElementById('substituicoes-list');
    if (!div) return;
    let titulares = s.meuTime.jogadores.slice(0, 5); // Exemplo: 5 titulares
    let reservas = s.meuTime.jogadores.slice(5);
    div.innerHTML = `<b>Titulares:</b><br>${titulares.map(j=>`${j.nome} (${j.pos})`).join(', ')}<br><b>Reservas:</b><br>${reservas.map(j=>`<button onclick="fazerSubstituicao('${j.nome}')">${j.nome} (${j.pos})</button>`).join(' ')}`;
}

function fazerSubstituicao(nomeReserva) {
    const s = simulacao;
    if (s.podeSubstituir <= 0) return;
    let titulares = s.meuTime.jogadores.slice(0, 5);
    let reservas = s.meuTime.jogadores.slice(5);
    let idxReserva = reservas.findIndex(j=>j.nome===nomeReserva);
    if (idxReserva === -1) return;
    // Troca com o primeiro titular
    let titular = titulares[0];
    s.meuTime.jogadores[0] = reservas[idxReserva];
    s.meuTime.jogadores[5+idxReserva] = titular;
    s.podeSubstituir--;
    addNarracao(`🔄 Substituição: entra ${reservas[idxReserva].nome}, sai ${titular.nome}`);
    renderSubstituicoes();
}

function alterarTatica(formacao) {
    simulacao.taticaAtual = formacao;
    addNarracao(`📋 Tática alterada para ${formacao}`);
}

function alterarInstrucao(instrucao) {
    simulacao.instrucao = instrucao;
    addNarracao(`🗣️ Instrução: ${instrucao}`);
}

function atualizarTempoCampeonato() {
    if (!simulacao) return;
    simulacao.tempo += Math.floor(Math.random()*3)+1;
    if (simulacao.tempo > 90) {
        simulacao.tempo = 90;
        finalizarPartidaCampeonato();
        return;
    }
    document.getElementById('live-time').textContent = simulacao.tempo + "'";
    if (Math.random() < 0.7) registrarEventoCampeonato();
}

function registrarEventoCampeonato() {
    const s = simulacao;
    // Probabilidades influenciadas por tática e instrução
    let probGolA = 0.12, probGolB = 0.12;
    if (s.taticaAtual === '4-3-3') probGolA += 0.08;
    if (s.taticaAtual === '4-5-1') s.stats.posseA += 2;
    if (s.instrucao === 'Atacar mais') probGolA += 0.07;
    if (s.instrucao === 'Segurar resultado') probGolB -= 0.05;
    if (s.instrucao === 'Pressionar alto') s.stats.desarmesA += 1;
    // Evento
    let evento = Math.random();
    if (evento < probGolA) {
        s.placarA++; s.stats.finalizA++; s.stats.noGolA++;
        addNarracao(`⚽ GOL! ${s.timeA} marca! Placar: <b>${s.placarA} x ${s.placarB}</b>`);
    } else if (evento < probGolA + probGolB) {
        s.placarB++; s.stats.finalizB++; s.stats.noGolB++;
        addNarracao(`⚽ GOL! ${s.timeB} marca! Placar: <b>${s.placarA} x ${s.placarB}</b>`);
    } else {
        // Outros eventos
        let outros = [
            () => { addNarracao(`🟨 Amarelo para ${Math.random()<0.5?s.timeA:s.timeB}`); },
            () => { addNarracao(`🟥 Vermelho para ${Math.random()<0.5?s.timeA:s.timeB}`); },
            () => { addNarracao(`😱 Chance clara desperdiçada!`); },
            () => { addNarracao(`🛡️ Desarme importante!`); },
            () => { addNarracao(`❌ Passe errado!`); }
        ];
        outros[Math.floor(Math.random()*outros.length)]();
    }
    atualizarPlacarStats();
}

function finalizarPartidaCampeonato() {
    clearInterval(simulacao.intervalo);
    // Atualiza classificação e histórico
    const s = simulacao;
    s.meuTime.golsPro += s.placarA;
    s.meuTime.golsContra += s.placarB;
    s.meuTime.saldo = s.meuTime.golsPro - s.meuTime.golsContra;
    if (s.placarA > s.placarB) { s.meuTime.pontos += 3; s.meuTime.vitorias++; s.advTime.derrotas++; }
    else if (s.placarA < s.placarB) { s.advTime.pontos += 3; s.advTime.vitorias++; s.meuTime.derrotas++; }
    else { s.meuTime.pontos++; s.advTime.pontos++; s.meuTime.empates++; s.advTime.empates++; }
    s.meuTime.historico.push({ adv: s.advTime.nome, g: s.placarA, gc: s.placarB, rodada: s.camp.rodadaAtual });
    s.advTime.historico.push({ adv: s.meuTime.nome, g: s.placarB, gc: s.placarA, rodada: s.camp.rodadaAtual });
    s.camp.rodadaAtual++;
    salvarCampeonato(s.camp);
    renderResultadosRodada([
        { timeA: s.timeA, escudoA: s.logoA, golA: s.placarA, timeB: s.timeB, escudoB: s.logoB, golB: s.placarB },
        ...s.outrosResultados
    ], s.camp);
    simulacao = null;
}

function renderResultadosRodada(resultados, camp) {
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Resultados da Rodada ${camp.rodadaAtual}</h3>
        <table class="elenco-table"><thead><tr><th>Jogo</th><th>Placar</th></tr></thead><tbody>
            ${resultados.map(j=>`<tr><td>${j.escudoA} ${j.timeA} x ${j.timeB} ${j.escudoB}</td><td>${j.golA} x ${j.golB}</td></tr>`).join('')}
        </tbody></table>
        <button class="elenco-acao-btn" id="btn-ver-tabela" style="margin-top:18px;">Ver Tabela</button>
    `;
    document.getElementById('btn-ver-tabela').onclick = () => renderTabelaClassificacao(camp.times);
}

// Inicialização automática da tabela ao abrir o jogo
window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('main-center')) {
        let camp = carregarCampeonato();
        if (!camp) camp = iniciarCampeonato();
        renderTabelaClassificacao(camp.times);
    }
});
// --- CAMPEONATO COMPLETO ---
const NOMES_TIMES = [
    'Araxá', 'Bangu', 'Caxias', 'Democrata', 'Estrela', 'Ferroviária', 'Guarani', 'Horizonte', 'Ipatinga', 'Juventus',
    'Londrina', 'Maringá', 'Nacional', 'Operário', 'Paulista', 'Quissamã', 'Rio Branco', 'Serrano', 'Tupi', 'União'
];
const ESCUDOS = ['🟢','🔵','🔴','🟡','🟣','🟤','⚫','⚪','🟠','🟧','🟥','🟦','🟩','🟨','🟪','🟫','⬛','⬜','🔶','🔷'];
const CORES = ['#2ecc71','#3498db','#e74c3c','#f1c40f','#9b59b6','#8d5524','#222','#fff','#ff9800','#ffb300','#c0392b','#2980b9','#27ae60','#f39c12','#8e44ad','#7f8c8d','#34495e','#ecf0f1','#e67e22','#16a085'];

function gerarTimesFicticios() {
    return NOMES_TIMES.map((nome, i) => ({
        id: i,
        nome,
        escudo: ESCUDOS[i],
        cor: CORES[i],
        pontos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        saldo: 0,
        golsPro: 0,
        golsContra: 0,
        jogadores: gerarElencoFicticio(nome),
        moral: 100,
        lesoes: [],
        historico: [],
        artilheiro: null
    }));
}

function gerarCalendario(times) {
    // Gera confrontos de turno único (round-robin)
    const n = times.length;
    let rodadas = [];
    let arr = [...Array(n).keys()];
    for (let r = 0; r < n - 1; r++) {
        let rodada = [];
        for (let i = 0; i < n / 2; i++) {
            rodada.push([arr[i], arr[n - 1 - i]]);
        }
        arr.splice(1, 0, arr.pop());
        rodadas.push(rodada);
    }
    return rodadas;
}

function iniciarCampeonato() {
    const times = gerarTimesFicticios();
    const calendario = gerarCalendario(times);
    const campeonato = {
        times,
        calendario,
        rodadaAtual: 0,
        historicoRodadas: [],
        artilharia: [],
        meuTimeId: 0, // será definido ao carregar save
        taticas: {},
        instrucoes: {},
        temporada: 1
    };
    salvarCampeonato(campeonato);
    return campeonato;
}

function salvarCampeonato(campeonato) {
    localStorage.setItem('campeonato', JSON.stringify(campeonato));
}
function carregarCampeonato() {
    return JSON.parse(localStorage.getItem('campeonato') || 'null');
}

function atualizarClassificacao(times) {
    return [...times].sort((a, b) =>
        b.pontos - a.pontos || b.vitorias - a.vitorias || b.saldo - a.saldo || b.golsPro - a.golsPro
    );
}

function jogarRodada(campeonato) {
    const rodada = campeonato.calendario[campeonato.rodadaAtual];
    let resultados = [];
    rodada.forEach(([idA, idB]) => {
        const timeA = campeonato.times[idA];
        const timeB = campeonato.times[idB];
        // Simulação simples: força aleatória + moral + tática
        let forcaA = timeA.jogadores.reduce((s, j) => s + j.energia, 0) + timeA.moral;
        let forcaB = timeB.jogadores.reduce((s, j) => s + j.energia, 0) + timeB.moral;
        let golA = Math.max(0, Math.round((Math.random() * 1.2 + 0.7) * forcaA / 1000 + Math.random()*2));
        let golB = Math.max(0, Math.round((Math.random() * 1.2 + 0.7) * forcaB / 1000 + Math.random()*2));
        // Atualiza classificação
        timeA.golsPro += golA; timeA.golsContra += golB;
        timeB.golsPro += golB; timeB.golsContra += golA;
        timeA.saldo = timeA.golsPro - timeA.golsContra;
        timeB.saldo = timeB.golsPro - timeB.golsContra;
        if (golA > golB) { timeA.pontos += 3; timeA.vitorias++; timeB.derrotas++; }
        else if (golA < golB) { timeB.pontos += 3; timeB.vitorias++; timeA.derrotas++; }
        else { timeA.pontos++; timeB.pontos++; timeA.empates++; timeB.empates++; }
        // Histórico
        timeA.historico.push({ adv: timeB.nome, g: golA, gc: golB, rodada: campeonato.rodadaAtual });
        timeB.historico.push({ adv: timeA.nome, g: golB, gc: golA, rodada: campeonato.rodadaAtual });
        resultados.push({ timeA: timeA.nome, escudoA: timeA.escudo, golA, timeB: timeB.nome, escudoB: timeB.escudo, golB });
    });
    campeonato.rodadaAtual++;
    campeonato.historicoRodadas.push(resultados);
    salvarCampeonato(campeonato);
    return resultados;
}

// Exemplo de uso:
// let camp = iniciarCampeonato();
// let res = jogarRodada(camp);
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
    // Dados do usuário
    const jogador = JSON.parse(localStorage.getItem('jogador') || '{}');
    // Campeonato
    let camp = carregarCampeonato();
    if (!camp) camp = iniciarCampeonato();
    // Define o meuTimeId se não estiver salvo
    if (typeof camp.meuTimeId !== 'number' || camp.meuTimeId < 0) {
        // Procura pelo nome do time do usuário
        const idx = camp.times.findIndex(t => t.nome === jogador.time);
        camp.meuTimeId = idx >= 0 ? idx : 0;
        salvarCampeonato(camp);
    }
    // Cabeçalho
    document.getElementById('header-team-logo').textContent = camp.times[camp.meuTimeId].escudo;
    document.getElementById('header-team-name').textContent = camp.times[camp.meuTimeId].nome;
    document.getElementById('header-finance').textContent = 'R$ ' + (save.data.saldo || 15000000).toLocaleString('pt-BR');
    document.getElementById('header-reputation').textContent = 'Reputação: ' + (save.data.reputacao || 60);
    document.getElementById('header-date').textContent = save.data.data || '01/01/2025';
    document.getElementById('header-round').textContent = 'Rodada ' + (camp.rodadaAtual+1);

    // Menu principal: listeners
    document.getElementById('btn-menu-elenco').onclick = () => renderElenco(camp.times[camp.meuTimeId].jogadores);
    document.getElementById('btn-menu-treinos').onclick = () => renderTreinos();
    document.getElementById('btn-menu-proximojogo').onclick = () => renderTabelaClassificacao(camp.times);
    document.getElementById('btn-menu-transferencias').onclick = () => renderTransferencias();
    document.getElementById('btn-menu-tatica').onclick = () => renderTatica();
    document.getElementById('btn-menu-opcoes').onclick = () => renderOpcoes();

    // Área central: Tabela do Campeonato
    renderTabelaClassificacao(camp.times);

    // Lateral: próximo jogo (exemplo)
    const proximo = camp.calendario[camp.rodadaAtual]?.find(([a,b])=>a===camp.meuTimeId||b===camp.meuTimeId);
    let adv = proximo ? camp.times[proximo[0]===camp.meuTimeId?proximo[1]:proximo[0]] : { nome: '-', escudo: '-' };
    document.getElementById('aside-next-match-info').innerHTML = `
        <b>Adversário:</b> ${adv.nome}<br>
        <b>Escudo:</b> ${adv.escudo}<br>
        <b>Rodada:</b> ${camp.rodadaAtual+1}
    `;
    // Lateral: confiança (exemplo fixo)
    document.getElementById('aside-confidence-board').textContent = (save.data.confiancaBoard || 70) + '%';
    document.getElementById('aside-confidence-fans').textContent = (save.data.confiancaFans || 65) + '%';
    // Lateral: notícias
    const newsList = document.getElementById('aside-news-list');
    newsList.innerHTML = '';
    (save.data.noticias||[]).forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        newsList.appendChild(li);
    });
    // Lateral: gráfico elenco
    renderMiniGraficoElenco(camp.times[camp.meuTimeId].jogadores);
    // Lateral: histórico
    const histList = document.getElementById('aside-history-list');
    histList.innerHTML = '';
    (camp.times[camp.meuTimeId].historico||[]).slice(-5).forEach(j => {
        const li = document.createElement('li');
        li.textContent = `R${j.rodada+1}: ${j.g}x${j.gc} vs ${j.adv}`;
        histList.appendChild(li);
    });
    // Lateral: notificações
    const notifList = document.getElementById('aside-notifications-list');
    notifList.innerHTML = '';
    (save.data.notificacoes||[]).forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        notifList.appendChild(li);
    });
    // Botão avançar semana (opcional)
    document.getElementById('btn-avancar-semana').onclick = () => jogarProximaRodadaUI();
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
// --- SIMULAÇÃO DE PARTIDA ---
let simulacao = null;

function renderProximoJogo(proximoJogo) {
    const center = document.getElementById('main-center');
    center.innerHTML = `<h3>Próximo Jogo</h3>
        <b>Adversário:</b> ${proximoJogo.adversario}<br>
        <b>Local:</b> ${proximoJogo.local}<br>
        <b>Data:</b> ${proximoJogo.data}<br>
        <button id="btn-iniciar-jogo" class="elenco-acao-btn" style="margin-top:18px;">Iniciar Jogo Ao Vivo</button>`;
    document.getElementById('btn-iniciar-jogo').onclick = () => iniciarJogo(proximoJogo);
}

function iniciarJogo(proximoJogo) {
    // Dados iniciais
    const jogador = JSON.parse(localStorage.getItem('jogador') || '{}');
    const timeA = jogador.time || 'Seu Time';
    const logoA = getLogoIcon(jogador.logo || 'logo1');
    const timeB = proximoJogo.adversario || 'Adversário';
    const logoB = '🏆';
    simulacao = {
        tempo: 0,
        placarA: 0,
        placarB: 0,
        eventos: [],
        stats: {
            posseA: 50, posseB: 50,
            finalizA: 0, finalizB: 0,
            noGolA: 0, noGolB: 0,
            desarmesA: 0, desarmesB: 0,
            errosPasseA: 0, errosPasseB: 0
        },
        timeA, logoA, timeB, logoB,
        proximoJogo,
        intervalo: null
    };
    renderTelaAoVivo();
    simulacao.intervalo = setInterval(atualizarTempo, 700);
}

function renderTelaAoVivo() {
    const c = document.getElementById('main-center');
    const s = simulacao;
    c.innerHTML = `
        <div class="live-header">
            <span class="team-logo">${s.logoA}</span>
            <span class="live-score" id="live-score">${s.placarA} x ${s.placarB}</span>
            <span class="team-logo">${s.logoB}</span>
        </div>
        <div class="live-info">
            <span id="live-time">${s.tempo}'</span> • <span>${s.proximoJogo.local} - Estádio</span>
        </div>
        <div class="live-stats">
            <div>Posse: <b id="stat-posse">${s.stats.posseA}% - ${s.stats.posseB}%</b></div>
            <div>Finalizações: <b id="stat-finaliz">${s.stats.finalizA} - ${s.stats.finalizB}</b></div>
            <div>No Gol: <b id="stat-nogol">${s.stats.noGolA} - ${s.stats.noGolB}</b></div>
            <div>Desarmes: <b id="stat-desarmes">${s.stats.desarmesA} - ${s.stats.desarmesB}</b></div>
            <div>Erros Passe: <b id="stat-erros">${s.stats.errosPasseA} - ${s.stats.errosPasseB}</b></div>
        </div>
        <div class="live-narracao" id="live-narracao" style="height:120px;overflow-y:auto;background:rgba(0,0,0,0.12);margin:18px 0 0 0;padding:10px 12px;border-radius:8px;font-size:1em;"></div>
    `;
}

function atualizarTempo() {
    if (!simulacao) return;
    simulacao.tempo += Math.floor(Math.random()*3)+1; // avança 1-3 min
    if (simulacao.tempo > 90) {
        simulacao.tempo = 90;
        finalizarJogo();
        return;
    }
    document.getElementById('live-time').textContent = simulacao.tempo + "'";
    if (Math.random() < 0.7) registrarEvento();
}

function registrarEvento() {
    const s = simulacao;
    const eventos = [
        () => { // Gol
            const quem = Math.random() < 0.5 ? 'A' : 'B';
            if (quem === 'A') { s.placarA++; s.stats.finalizA++; s.stats.noGolA++; } else { s.placarB++; s.stats.finalizB++; s.stats.noGolB++; }
            addNarracao(`⚽ GOL! ${quem==='A'?s.timeA:s.timeB} marca! Placar: <b>${s.placarA} x ${s.placarB}</b>`);
            atualizarPlacarStats();
        },
        () => { // Cartão
            const quem = Math.random() < 0.5 ? s.timeA : s.timeB;
            const tipo = Math.random() < 0.8 ? '🟨 Amarelo' : '🟥 Vermelho';
            addNarracao(`${tipo} para ${quem}!`);
        },
        () => { // Substituição
            const quem = Math.random() < 0.5 ? s.timeA : s.timeB;
            addNarracao(`🔄 Substituição em ${quem}.`);
        },
        () => { // Chance perdida
            const quem = Math.random() < 0.5 ? s.timeA : s.timeB;
            addNarracao(`😱 ${quem}: chance clara desperdiçada!`);
            if (quem==='A') s.stats.finalizA++; else s.stats.finalizB++;
            atualizarPlacarStats();
        },
        () => { // Desarme
            const quem = Math.random() < 0.5 ? 'A' : 'B';
            if (quem==='A') s.stats.desarmesA++; else s.stats.desarmesB++;
            addNarracao(`🛡️ Desarme importante de ${quem==='A'?s.timeA:s.timeB}.`);
            atualizarPlacarStats();
        },
        () => { // Erro de passe
            const quem = Math.random() < 0.5 ? 'A' : 'B';
            if (quem==='A') s.stats.errosPasseA++; else s.stats.errosPasseB++;
            addNarracao(`❌ Passe errado de ${quem==='A'?s.timeA:s.timeB}.`);
            atualizarPlacarStats();
        },
        () => { // Posse de bola
            let delta = Math.floor(Math.random()*5)+1;
            if (Math.random()<0.5) delta = -delta;
            s.stats.posseA = Math.max(30, Math.min(70, s.stats.posseA+delta));
            s.stats.posseB = 100-s.stats.posseA;
            addNarracao(`🔄 Disputa de posse de bola.`);
            atualizarPlacarStats();
        }
    ];
    // Sorteia evento (gol mais raro)
    let idx = Math.floor(Math.random()*eventos.length);
    if (simulacao.tempo < 10 && idx === 0) idx = 1; // evita gol muito cedo
    if (Math.random() < 0.15) idx = 0; // 15% chance de gol
    eventos[idx]();
}

function addNarracao(msg) {
    const narr = document.getElementById('live-narracao');
    if (!narr) return;
    const p = document.createElement('div');
    p.innerHTML = `<span style='color:#ffd700;'>${simulacao.tempo}'</span> ${msg}`;
    narr.appendChild(p);
    narr.scrollTop = narr.scrollHeight;
    simulacao.eventos.push({ tempo: simulacao.tempo, msg });
}

function atualizarPlacarStats() {
    document.getElementById('live-score').textContent = `${simulacao.placarA} x ${simulacao.placarB}`;
    document.getElementById('stat-posse').textContent = `${simulacao.stats.posseA}% - ${simulacao.stats.posseB}%`;
    document.getElementById('stat-finaliz').textContent = `${simulacao.stats.finalizA} - ${simulacao.stats.finalizB}`;
    document.getElementById('stat-nogol').textContent = `${simulacao.stats.noGolA} - ${simulacao.stats.noGolB}`;
    document.getElementById('stat-desarmes').textContent = `${simulacao.stats.desarmesA} - ${simulacao.stats.desarmesB}`;
    document.getElementById('stat-erros').textContent = `${simulacao.stats.errosPasseA} - ${simulacao.stats.errosPasseB}`;
}

function finalizarJogo() {
    clearInterval(simulacao.intervalo);
    renderTelaResultados();
    simulacao = null;
}

function renderTelaResultados() {
    const c = document.getElementById('main-center');
    // Notas dos jogadores (aleatórias)
    const elenco = JSON.parse(localStorage.getItem('saveSelecionado')||'{}').data?.elenco || gerarElencoFicticio();
    const notas = elenco.map(j => ({ nome: j.nome, pos: j.pos, nota: (Math.random()*4+5).toFixed(1) }));
    // Resultados da rodada
    const outrosJogos = [];
    const times = [
        'Flamengo','Palmeiras','Corinthians','São Paulo','Grêmio','Internacional','Atlético-MG','Santos','Vasco','Botafogo','Cruzeiro','Bahia','Fortaleza','Athletico-PR'
    ];
    for(let i=0;i<6;i++) {
        let t1 = times.splice(Math.floor(Math.random()*times.length),1)[0];
        let t2 = times.splice(Math.floor(Math.random()*times.length),1)[0];
        outrosJogos.push({
            t1, t2,
            p1: Math.floor(Math.random()*4),
            p2: Math.floor(Math.random()*4)
        });
    }
    c.innerHTML = `
        <h3>Resultado Final</h3>
        <div class="live-header">
            <span class="team-logo">${getLogoIcon(JSON.parse(localStorage.getItem('jogador')||'{}').logo||'logo1')}</span>
            <span class="live-score">${simulacao.placarA} x ${simulacao.placarB}</span>
            <span class="team-logo">🏆</span>
        </div>
        <div class="live-info">Estádio: ${simulacao.proximoJogo.local} • Público: ${Math.floor(Math.random()*20000+10000)}<br></div>
        <div class="live-stats">
            <div>Posse: <b>${simulacao.stats.posseA}% - ${simulacao.stats.posseB}%</b></div>
            <div>Finalizações: <b>${simulacao.stats.finalizA} - ${simulacao.stats.finalizB}</b></div>
            <div>No Gol: <b>${simulacao.stats.noGolA} - ${simulacao.stats.noGolB}</b></div>
            <div>Desarmes: <b>${simulacao.stats.desarmesA} - ${simulacao.stats.desarmesB}</b></div>
            <div>Erros Passe: <b>${simulacao.stats.errosPasseA} - ${simulacao.stats.errosPasseB}</b></div>
        </div>
        <h4>Melhores Momentos</h4>
        <div class="live-narracao" style="height:100px;overflow-y:auto;background:rgba(0,0,0,0.10);margin:10px 0 18px 0;padding:8px 10px;border-radius:8px;font-size:0.98em;">
            ${simulacao.eventos.slice(-8).map(e=>`<div><span style='color:#ffd700;'>${e.tempo}'</span> ${e.msg}</div>`).join('')}
        </div>
        <h4>Notas dos Jogadores</h4>
        <table class="elenco-table"><thead><tr><th>Nome</th><th>Posição</th><th>Nota</th></tr></thead><tbody>
            ${notas.map(j=>`<tr><td>${j.nome}</td><td>${j.pos}</td><td>${j.nota}</td></tr>`).join('')}
        </tbody></table>
        <h4>Resultados da Rodada</h4>
        <table class="elenco-table"><thead><tr><th>Jogo</th><th>Placar</th></tr></thead><tbody>
            ${outrosJogos.map(j=>`<tr><td>${j.t1} x ${j.t2}</td><td>${j.p1} x ${j.p2}</td></tr>`).join('')}
        </tbody></table>
        <button class="elenco-acao-btn" id="btn-voltar-jogo" style="margin-top:18px;">Voltar ao Menu</button>
    `;
    document.getElementById('btn-voltar-jogo').onclick = () => {
        renderProximoJogo(simulacao.proximoJogo);
    };
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
