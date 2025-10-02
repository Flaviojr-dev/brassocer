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
        html += `<li data-rodada="${i}" style='${i===camp.rodadaAtual?"font-weight:700;color:var(--gold);":i<camp.rodadaAtual?"color:#aaa;":""}'>Rodada ${i+1} ${i<camp.rodadaAtual?"✓":""}</li>`;
    });
    html += '</ul>';
    div.innerHTML = html;
    // Adiciona funcionalidade: clique mostra resultados da rodada
    div.querySelectorAll('li[data-rodada]').forEach(li => {
        li.onclick = function() {
            const rodadaIdx = parseInt(this.getAttribute('data-rodada'));
            mostrarResultadosRodadaCalendario(rodadaIdx);
        };
    });
}

function mostrarResultadosRodadaCalendario(idx) {
    const camp = carregarCampeonato();
    const center = document.getElementById('main-center');
    if (!camp) return;

    // Função para carregar times.json (cache simples)
    if (!window.__TIMES_META_CACHE) window.__TIMES_META_CACHE = null;
    function loadTimesMeta() {
        return new Promise((resolve, reject) => {
            if (window.__TIMES_META_CACHE) return resolve(window.__TIMES_META_CACHE);
            fetch('times.json').then(r => {
                if (!r.ok) return resolve(null);
                return r.json();
            }).then(json => {
                window.__TIMES_META_CACHE = json;
                resolve(json);
            }).catch(e => resolve(null));
        });
    }

    loadTimesMeta().then(timesMeta => {
        const rodada = camp.calendario[idx];
        // Encontra o confronto do meu time
        const meuIdx = camp.meuTimeId;
        let confronto = rodada ? rodada.find(([a,b]) => a===meuIdx || b===meuIdx) : null;
        if (!confronto) {
            // Mostra lista dos jogos da rodada mesmo que meu time não jogue
            const resultados = camp.historicoRodadas && camp.historicoRodadas[idx] ? camp.historicoRodadas[idx] : null;
            if (resultados) {
                center.innerHTML = `<h3>Resultados da Rodada ${idx+1}</h3>
                    <table class="elenco-table"><thead><tr><th>Jogo</th><th>Placar</th></tr></thead><tbody>
                    ${resultados.map(j=>`<tr><td>${j.escudoA} ${j.timeA} x ${j.timeB} ${j.escudoB}</td><td>${j.golA} x ${j.golB}</td></tr>`).join('')}
                    </tbody></table>
                    <button class="elenco-acao-btn" id="btn-voltar-tabela" style="margin-top:18px;">Voltar</button>`;
                document.getElementById('btn-voltar-tabela').onclick = () => renderTabelaClassificacao(camp.times);
                return;
            }
            center.innerHTML = `<h3>Rodada ${idx+1}</h3><div style='margin:18px 0;'>Esta rodada ainda não foi jogada.</div><button class="elenco-acao-btn" id="btn-voltar-tabela">Voltar</button>`;
            document.getElementById('btn-voltar-tabela').onclick = () => renderTabelaClassificacao(camp.times);
            return;
        }

        const [idA, idB] = confronto;
        const adversarioId = idA === meuIdx ? idB : idA;
        const adversario = camp.times[adversarioId];
        const meta = timesMeta ? timesMeta.find(t => t.nome === adversario.nome || t.id === adversarioId) : null;

        // Monta últimos 5 resultados do adversário (do histórico do time)
        const ultimos = (adversario.historico||[]).slice(-5).map(h => `R${h.rodada+1}: ${h.g}x${h.gc} vs ${h.adv}`).reverse();

        // Se a rodada já tem resultados, pega placar
        const rodadaResult = camp.historicoRodadas && camp.historicoRodadas[idx] ? camp.historicoRodadas[idx].find(r => (r.timeA===adversario.nome || r.timeB===adversario.nome)) : null;

        // Renderiza card com estilo existente (fundo azul escuro, caixas arredondadas, destaque)
        const prob = calcularProbabilidades(camp.times[camp.meuTimeId], adversario);
        const xgAd = estimarXG(12, meta?meta.defesa:65);
        center.innerHTML = `
            <div class='team-card'>
                <div class='team-header'>
                    ${meta && meta.escudoImage ? `<img src='${meta.escudoImage}' alt='${adversario.nome}'/>` : `<div style='width:72px;height:72px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:36px'>${adversario.escudo||''}</div>`}
                    <div>
                        <h3 style='margin:0;color:#bfffc9'>${adversario.nome}</h3>
                        <div style='color:#cfefff;font-size:0.95em;margin-top:6px;'>${meta ? meta.estadio : 'Estádio desconhecido'} • Capacidade: ${meta ? meta.capacidade.toLocaleString() : '–'}</div>
                    </div>
                    <div class='team-badges'>
                        <div class='badge-small'>${meta?('OVR '+meta.overall):''}</div>
                    </div>
                </div>
                <div class='team-stats'>
                    <div class='stat-box'><div class='label'>Ataque</div><div class='value'>${meta?meta.ataque:'–'}</div></div>
                    <div class='stat-box'><div class='label'>Meio</div><div class='value'>${meta?meta.meio:'–'}</div></div>
                    <div class='stat-box'><div class='label'>Defesa</div><div class='value'>${meta?meta.defesa:'–'}</div></div>
                    <div class='stat-box' style='flex:1'><div class='label'>Últimos 5 jogos</div><div style='margin-top:6px;'>${ultimos.length?'<ul style="margin:6px 0 0 16px;padding:0;color:#e6f7ff;">'+ultimos.map(u=>`<li>${u}</li>`).join('')+'</ul>':'Sem histórico'}</div></div>
                </div>
                <div style='margin-top:12px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;'>
                    <div style='flex:1'>
                        <div style='font-size:0.85em;color:#cfefff'>Probabilidades</div>
                        <div class='probability' style='margin-top:6px;'>
                            <div class='label'>Você</div>
                            <div class='bar'><i style='width:${Math.round(prob.pA*100)}%'></i></div>
                            <div style='width:48px;text-align:right;font-weight:700'>${Math.round(prob.pA*100)}%</div>
                        </div>
                        <div class='probability' style='margin-top:6px;'>
                            <div class='label'>Empate</div>
                            <div class='bar'><i style='width:${Math.round(prob.pDraw*100)}%'></i></div>
                            <div style='width:48px;text-align:right;font-weight:700'>${Math.round(prob.pDraw*100)}%</div>
                        </div>
                        <div class='probability' style='margin-top:6px;'>
                            <div class='label'>Advers.</div>
                            <div class='bar'><i style='width:${Math.round(prob.pB*100)}%'></i></div>
                            <div style='width:48px;text-align:right;font-weight:700'>${Math.round(prob.pB*100)}%</div>
                        </div>
                    </div>
                    <div style='width:180px;'>
                        <div style='font-size:0.85em;color:#cfefff'>xG Estimado</div>
                        <div style='margin-top:8px' class='progress'><i style='width:${Math.min(100,Math.round((xgAd/4)*100))}%'></i></div>
                        <div style='margin-top:6px;font-weight:700;color:#bfffc9'>${xgAd.toFixed(2)} xG</div>
                    </div>
                </div>
                ${rodadaResult ? `<div style='margin-top:14px;padding:12px;background:rgba(0,0,0,0.12);border-radius:8px;font-weight:700;color:#fff'>Placar: ${rodadaResult.golA} x ${rodadaResult.golB}</div>` : `<div style='margin-top:14px;color:#dcefff;font-size:0.95em;'>Esta rodada ainda não foi jogada.</div>`}
                <div style='margin-top:14px;display:flex;gap:8px;justify-content:flex-end;'>
                    <button class='elenco-acao-btn' id='btn-voltar-tabela'>Voltar</button>
                    <button class='btn-scout' id='btn-scout'>Scouting</button>
                </div>
            </div>
        `;

        document.getElementById('btn-voltar-tabela').onclick = () => renderTabelaClassificacao(camp.times);
        document.getElementById('btn-scout').onclick = () => abrirModalScouting(adversario, meta);

        document.getElementById('btn-voltar-tabela').onclick = () => renderTabelaClassificacao(camp.times);
    });
}

// --- Funções auxiliares para análise técnica ---
function calcularForma(time, ultimaN=5) {
    const hist = (time.historico||[]).slice(-ultimaN).reverse();
    // Pontos nos últimos N jogos: vitória=3, empate=1, derrota=0
    let pontos = hist.reduce((s,h) => {
        if (h.g > h.gc) return s+3; if (h.g === h.gc) return s+1; return s;
    }, 0);
    return { jogos: hist.length, pontos, media: hist.length ? (pontos / (hist.length*3)) : 0 };
}

function desempenhoMandanteVisitante(time, campeonato) {
    // Calcula desempenho básico com base no histórico
    const hist = time.historico || [];
    let mandante = { jogos:0, v:0, e:0, d:0 };
    let visitante = { jogos:0, v:0, e:0, d:0 };
    hist.forEach(h => {
        // Histórico salvo como adv e gols; não sabe se foi em casa neste modelo simplificado
        // Assumimos alternância com base na rodada e no id do time para criar uma noção
        const emCasa = (h.rodada % 2 === 0);
        let res = (h.g > h.gc) ? 'v' : (h.g===h.gc? 'e':'d');
        if (emCasa) { mandante.jogos++; mandante[res]++; } else { visitante.jogos++; visitante[res]++; }
    });
    return { mandante, visitante };
}

function estimarXG(finalizacoes, defesaAdversaria) {
    // xG estimado base em finalizações e qualidade defensiva
    let taxa = 0.12; // base
    taxa *= (finalizacoes/12);
    taxa *= (60/defesaAdversaria);
    return Math.max(0.1, Math.min(4, finalizacoes * taxa));
}

function calcularProbabilidades(timeA, timeB) {
    // Retorna probabilidades aproximadas de vitória/empate/derrota com base em overall
    const oA = (timeA.overall || averageTeamOverall(timeA));
    const oB = (timeB.overall || averageTeamOverall(timeB));
    const diff = oA - oB;
    // logistic-ish
    const pAwin = 1 / (1 + Math.exp(-diff/6));
    const pBwin = 1 - pAwin;
    const pDraw = 0.22; // base
    // Ajusta com margem
    const adj = (1 - pDraw);
    return { pA: +(pAwin*adj).toFixed(2), pDraw: pDraw, pB: +(pBwin*adj).toFixed(2) };
}

function averageTeamOverall(time) {
    if (time.jogadores && time.jogadores.length) {
        // média dos atributos (ataque/meio/defesa) se tiver jogadores com atributos
        const avg = time.jogadores.reduce((s,j)=>s + ((j.ataque||60)+(j.meio||60)+(j.defesa||60))/3, 0) / time.jogadores.length;
        return Math.round(avg);
    }
    return time.overall || 65;
}

function abrirModalScouting(adversario, meta) {
    // Cria modal com informações de scouting
    const body = document.body;
    const bg = document.createElement('div'); bg.className = 'modal-scout-bg';
    const modal = document.createElement('div'); modal.className = 'modal-scout';
    modal.innerHTML = `<button class='close'>&times;</button><h3>Scouting - ${adversario.nome}</h3>
        <div style='display:flex;gap:12px;align-items:center;margin-top:8px;'>
            <div style='width:84px;height:84px;border-radius:8px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center'>${meta && meta.escudoImage?`<img src='${meta.escudoImage}' style='width:76px;height:76px;object-fit:contain'/>`:adversario.escudo||''}</div>
            <div style='flex:1'>
                <div style='color:#cfefff'>${meta?meta.estadio:'Estádio: -'}</div>
                <div style='font-weight:800;color:#bfffc9;margin-top:6px'>Capacidade: ${meta?meta.capacidade.toLocaleString():"-"}</div>
            </div>
        </div>
        <div style='margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;'>
            <div style='min-width:120px'><div class='label' style='color:#cfefff'>Ataque</div><div style='font-weight:800;color:#bfffc9'>${meta?meta.ataque:'-'}</div></div>
            <div style='min-width:120px'><div class='label' style='color:#cfefff'>Meio</div><div style='font-weight:800;color:#bfffc9'>${meta?meta.meio:'-'}</div></div>
            <div style='min-width:120px'><div class='label' style='color:#cfefff'>Defesa</div><div style='font-weight:800;color:#bfffc9'>${meta?meta.defesa:'-'}</div></div>
        </div>
        <div style='margin-top:14px;display:flex;gap:8px;align-items:center;justify-content:flex-end'>
            <button class='btn-scout'>Gerar Relatório</button>
            <button class='elenco-acao-btn close'>Fechar</button>
        </div>`;
    bg.appendChild(modal); body.appendChild(bg);
    modal.querySelectorAll('.close').forEach(b=>b.onclick=()=>bg.remove());
}


function jogarProximaRodadaUI() {
    let camp = carregarCampeonato();
    if (!camp) return;
    // Verifica se ainda há rodadas
    if (camp.rodadaAtual >= camp.calendario.length) {
        // Campeonato acabou
        mostrarPremiacoes();
        return;
    }
    // Encontra o jogo do usuário na rodada
    const rodada = camp.calendario[camp.rodadaAtual];
    const meuJogo = rodada.find(([a, b]) => a === camp.meuTimeId || b === camp.meuTimeId);
    if (!meuJogo) {
        // Não há jogo do usuário nesta rodada
        renderTabelaClassificacao(camp.times);
        return;
    }
    // Simula os outros jogos da rodada (menos o do usuário)
    const outrosResultados = [];
    rodada.forEach(([a, b]) => {
        if ((a === camp.meuTimeId || b === camp.meuTimeId)) return;
        const timeA = camp.times[a];
        const timeB = camp.times[b];
        let forcaA = timeA.jogadores.reduce((s, j) => s + (j.energia||60), 0) + (timeA.moral||80);
        let forcaB = timeB.jogadores.reduce((s, j) => s + (j.energia||60), 0) + (timeB.moral||80);
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
        timeA.historico.push({ adv: timeB.nome, g: golA, gc: golB, rodada: camp.rodadaAtual });
        timeB.historico.push({ adv: timeA.nome, g: golB, gc: golA, rodada: camp.rodadaAtual });
        outrosResultados.push({ timeA: timeA.nome, escudoA: timeA.escudo, golA, timeB: timeB.nome, escudoB: timeB.escudo, golB });
    });
    // Atualiza moral, lesões, artilharia
    atualizarMoralEArtilharia(camp);
    sortearLesoes(camp);
    // Salva o campeonato antes do jogo do usuário
    salvarCampeonato(camp);
    // Inicia a tela de jogo ao vivo do usuário
    iniciarPartidaCampeonato(camp, { idA: meuJogo[0], idB: meuJogo[1] }, outrosResultados);
}

// Inicia a tela de jogo ao vivo do campeonato
function iniciarPartidaCampeonato(camp, meuJogo, outrosResultados) {
    const meuTime = camp.times[meuJogo.idA === camp.meuTimeId ? meuJogo.idA : meuJogo.idB];
    const advTime = camp.times[meuJogo.idA === camp.meuTimeId ? meuJogo.idB : meuJogo.idA];
    // Simula o jogo realista
    const simularJogo = (timeA, timeB) => {
        // Repete a mesma lógica modular da função simularJogo do patch anterior
        let ataqueA = timeA.jogadores.slice(0, 5).reduce((s, j) => s + (j.ataque||60), 0) / 5;
        let defesaA = timeA.jogadores.slice(0, 5).reduce((s, j) => s + (j.defesa||60), 0) / 5;
        let ataqueB = timeB.jogadores.slice(0, 5).reduce((s, j) => s + (j.ataque||60), 0) / 5;
        let defesaB = timeB.jogadores.slice(0, 5).reduce((s, j) => s + (j.defesa||60), 0) / 5;
        let moralA = timeA.moral || 80;
        let moralB = timeB.moral || 80;
        let energiaA = timeA.jogadores.reduce((s, j) => s + (j.energia||60), 0) / 11;
        let energiaB = timeB.jogadores.reduce((s, j) => s + (j.energia||60), 0) / 11;
        function getTaticaBonus(tatica) {
            switch (tatica) {
                case '4-3-3': return { ataque: 1.15, defesa: 0.92 };
                case '4-4-2': return { ataque: 1.0, defesa: 1.0 };
                case '3-5-2': return { ataque: 1.08, defesa: 0.98 };
                case '4-5-1': return { ataque: 0.93, defesa: 1.12 };
                case '5-4-1': return { ataque: 0.88, defesa: 1.18 };
                default: return { ataque: 1.0, defesa: 1.0 };
            }
        }
        let taticaA = getTaticaBonus(timeA.tatica||'4-4-2');
        let taticaB = getTaticaBonus(timeB.tatica||'4-4-2');
        let finalizA = Math.round((Math.random() * (16 - 8) + 8) * (ataqueA/60) * taticaA.ataque * (energiaA/70) * (moralA/80));
        let finalizB = Math.round((Math.random() * (16 - 8) + 8) * (ataqueB/60) * taticaB.ataque * (energiaB/70) * (moralB/80));
        finalizA = Math.max(6, Math.min(finalizA, 20));
        finalizB = Math.max(6, Math.min(finalizB, 20));
        let taxaGolA = Math.random() * (0.18 - 0.10) + 0.10;
        let taxaGolB = Math.random() * (0.18 - 0.10) + 0.10;
        taxaGolA *= (60 / defesaB) * taticaB.defesa;
        taxaGolB *= (60 / defesaA) * taticaA.defesa;
        let probEmpate = Math.random();
        let golsA = 0, golsB = 0;
        if (probEmpate < 0.10) {
            golsA = 0; golsB = 0;
        } else if (probEmpate < 0.35) {
            let gols = Math.random() < 0.5 ? 1 : 2;
            golsA = golsB = gols;
        } else {
            golsA = Math.round(finalizA * taxaGolA);
            golsB = Math.round(finalizB * taxaGolB);
            if (golsA > 4) golsA = 3 + Math.round(Math.random());
            if (golsB > 4) golsB = 3 + Math.round(Math.random());
            if (golsA + golsB > 7) {
                if (golsA > golsB) golsA = 4, golsB = Math.max(0, 3 - Math.round(Math.random()));
                else golsB = 4, golsA = Math.max(0, 3 - Math.round(Math.random()));
            }
        }
        let posseA = 0.5 + (ataqueA - ataqueB) / 200 + (Math.random()-0.5)*0.10;
        posseA = Math.max(0.4, Math.min(0.6, posseA));
        let posseB = 1 - posseA;
        let tempoGolsA = [];
        let tempoGolsB = [];
        let minutosDisponiveis = Array.from({length:90}, (_,i)=>i+1);
        for (let i=0; i<golsA; i++) {
            let idx = Math.floor(Math.random()*minutosDisponiveis.length);
            tempoGolsA.push(minutosDisponiveis[idx]);
            minutosDisponiveis.splice(idx,1);
        }
        for (let i=0; i<golsB; i++) {
            let idx = Math.floor(Math.random()*minutosDisponiveis.length);
            tempoGolsB.push(minutosDisponiveis[idx]);
            minutosDisponiveis.splice(idx,1);
        }
        tempoGolsA.sort((a,b)=>a-b);
        tempoGolsB.sort((a,b)=>a-b);
        let artilheirosA = [];
        let artilheirosB = [];
        for (let i=0; i<golsA; i++) {
            let j = timeA.jogadores[Math.floor(Math.random()*timeA.jogadores.length)];
            j.gols = (j.gols||0)+1;
            artilheirosA.push(j.nome);
        }
        for (let i=0; i<golsB; i++) {
            let j = timeB.jogadores[Math.floor(Math.random()*timeB.jogadores.length)];
            j.gols = (j.gols||0)+1;
            artilheirosB.push(j.nome);
        }
        return {
            golsA, golsB, tempoGolsA, tempoGolsB, posseA: Math.round(posseA*100), posseB: Math.round(posseB*100),
            finalizA, finalizB, artilheirosA, artilheirosB
        };
    };
    // Estado da simulação
    const resultado = simularJogo(meuTime, advTime);
    simulacao = {
        tempo: 0,
        placarA: 0,
        placarB: 0,
        eventos: [],
        stats: {
            posseA: resultado.posseA, posseB: resultado.posseB,
            finalizA: resultado.finalizA, finalizB: resultado.finalizB,
            noGolA: Math.round(resultado.finalizA * (Math.random()*0.5+0.3)),
            noGolB: Math.round(resultado.finalizB * (Math.random()*0.5+0.3)),
            desarmesA: Math.round(Math.random()*20+10),
            desarmesB: Math.round(Math.random()*20+10),
            errosPasseA: Math.round(Math.random()*10+5),
            errosPasseB: Math.round(Math.random()*10+5)
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
        taticaAtual: meuTime.tatica||'4-4-2',
        instrucao: 'Normal',
        substituicoes: [],
        podeSubstituir: 5,
        resultado: resultado
    };
    renderTelaAoVivoCampeonato();
    simulacao.intervalo = setInterval(atualizarTempoCampeonato, 700);
}

function realizarSubstituicaoEmJogo(jogoSim, jogadorSaiNome, jogadorEntraNome) {
    if (!jogoSim || jogoSim.podeSubstituir<=0) return false;
    const time = jogoSim.meuTime;
    const idxSai = time.jogadores.findIndex(j=>j.nome===jogadorSaiNome);
    const idxEntra = time.jogadores.findIndex(j=>j.nome===jogadorEntraNome);
    if (idxSai<0 || idxEntra<0) return false;
    // Troca status
    time.jogadores[idxSai].status = 'Reserva';
    time.jogadores[idxEntra].status = 'Titular';
    jogoSim.podeSubstituir--;
    addNarracao(`🔁 Substituição: ${jogadorEntraNome} entra no lugar de ${jogadorSaiNome}.`);
    salvarCampeonato(jogoSim.camp);
    return true;
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
                <div style="margin-top:10px;font-size:0.95em;color:#666;">
                    <b>Gols:</b> ${s.resultado ? `${s.resultado.golsA} (${s.resultado.artilheirosA.join(', ')}) x ${s.resultado.golsB} (${s.resultado.artilheirosB.join(', ')})` : ''}
                </div>
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
    // --- PARÂMETROS MODULARES ---
    const PROB_EMPATE = 0.25; // 25% dos jogos
    const PROB_ZERO_A_ZERO = 0.10; // 10% dos jogos
    const MEDIA_FINALIZACOES = [8, 16]; // por time
    const GOL_POR_FINALIZACAO = [0.10, 0.18]; // 10% a 18% das finalizações viram gol
    const POSSE_VARIACAO = 0.10; // 40% a 60%

    function getTaticaBonus(tatica) {
        // Exemplo: 4-3-3 = ataque+, defesa-, 5-4-1 = defesa++, ataque-
        switch (tatica) {
            case '4-3-3': return { ataque: 1.15, defesa: 0.92 };
            case '4-4-2': return { ataque: 1.0, defesa: 1.0 };
            case '3-5-2': return { ataque: 1.08, defesa: 0.98 };
            case '4-5-1': return { ataque: 0.93, defesa: 1.12 };
            case '5-4-1': return { ataque: 0.88, defesa: 1.18 };
            default: return { ataque: 1.0, defesa: 1.0 };
        }
    }

    function simularJogo(timeA, timeB) {
        // --- Força base ---
        let ataqueA = timeA.jogadores.slice(0, 5).reduce((s, j) => s + (j.ataque||60), 0) / 5;
        let defesaA = timeA.jogadores.slice(0, 5).reduce((s, j) => s + (j.defesa||60), 0) / 5;
        let ataqueB = timeB.jogadores.slice(0, 5).reduce((s, j) => s + (j.ataque||60), 0) / 5;
        let defesaB = timeB.jogadores.slice(0, 5).reduce((s, j) => s + (j.defesa||60), 0) / 5;
        // Moral e cansaço
        let moralA = timeA.moral || 80;
        let moralB = timeB.moral || 80;
        let energiaA = timeA.jogadores.reduce((s, j) => s + (j.energia||60), 0) / 11;
        let energiaB = timeB.jogadores.reduce((s, j) => s + (j.energia||60), 0) / 11;
        // Tática
        let taticaA = getTaticaBonus(timeA.tatica||'4-4-2');
        let taticaB = getTaticaBonus(timeB.tatica||'4-4-2');
        // Finalizações
        let finalizA = Math.round((Math.random() * (MEDIA_FINALIZACOES[1] - MEDIA_FINALIZACOES[0]) + MEDIA_FINALIZACOES[0]) * (ataqueA/60) * taticaA.ataque * (energiaA/70) * (moralA/80));
        let finalizB = Math.round((Math.random() * (MEDIA_FINALIZACOES[1] - MEDIA_FINALIZACOES[0]) + MEDIA_FINALIZACOES[0]) * (ataqueB/60) * taticaB.ataque * (energiaB/70) * (moralB/80));
        finalizA = Math.max(6, Math.min(finalizA, 20));
        finalizB = Math.max(6, Math.min(finalizB, 20));
        // Gols
        let taxaGolA = Math.random() * (GOL_POR_FINALIZACAO[1] - GOL_POR_FINALIZACAO[0]) + GOL_POR_FINALIZACAO[0];
        let taxaGolB = Math.random() * (GOL_POR_FINALIZACAO[1] - GOL_POR_FINALIZACAO[0]) + GOL_POR_FINALIZACAO[0];
        // Defesa influencia negativamente
        taxaGolA *= (60 / defesaB) * taticaB.defesa;
        taxaGolB *= (60 / defesaA) * taticaA.defesa;
        // Probabilidade de empate e 0x0
        let probEmpate = Math.random();
        let golsA = 0, golsB = 0;
        if (probEmpate < PROB_ZERO_A_ZERO) {
            golsA = 0; golsB = 0;
        } else if (probEmpate < PROB_EMPATE + PROB_ZERO_A_ZERO) {
            // Empate com gols
            let gols = Math.random() < 0.5 ? 1 : 2;
            golsA = golsB = gols;
        } else {
            golsA = Math.round(finalizA * taxaGolA);
            golsB = Math.round(finalizB * taxaGolB);
            // Limita placares absurdos
            if (golsA > 4) golsA = 3 + Math.round(Math.random());
            if (golsB > 4) golsB = 3 + Math.round(Math.random());
            // Evita 6x4, 8x7, etc
            if (golsA + golsB > 7) {
                if (golsA > golsB) golsA = 4, golsB = Math.max(0, 3 - Math.round(Math.random()));
                else golsB = 4, golsA = Math.max(0, 3 - Math.round(Math.random()));
            }
        }
        // Estatísticas
        let posseA = 0.5 + (ataqueA - ataqueB) / 200 + (Math.random()-0.5)*POSSE_VARIACAO;
        posseA = Math.max(0.4, Math.min(0.6, posseA));
        let posseB = 1 - posseA;
        // Gols distribuídos ao longo do tempo
        let tempoGolsA = [];
        let tempoGolsB = [];
        let minutosDisponiveis = Array.from({length:90}, (_,i)=>i+1);
        for (let i=0; i<golsA; i++) {
            let idx = Math.floor(Math.random()*minutosDisponiveis.length);
            tempoGolsA.push(minutosDisponiveis[idx]);
            minutosDisponiveis.splice(idx,1);
        }
        for (let i=0; i<golsB; i++) {
            let idx = Math.floor(Math.random()*minutosDisponiveis.length);
            tempoGolsB.push(minutosDisponiveis[idx]);
            minutosDisponiveis.splice(idx,1);
        }
        tempoGolsA.sort((a,b)=>a-b);
        tempoGolsB.sort((a,b)=>a-b);
        // Artilheiros
        let artilheirosA = [];
        let artilheirosB = [];
        for (let i=0; i<golsA; i++) {
            let j = timeA.jogadores[Math.floor(Math.random()*timeA.jogadores.length)];
            j.gols = (j.gols||0)+1;
            artilheirosA.push(j.nome);
        }
        for (let i=0; i<golsB; i++) {
            let j = timeB.jogadores[Math.floor(Math.random()*timeB.jogadores.length)];
            j.gols = (j.gols||0)+1;
            artilheirosB.push(j.nome);
        }
        // Atualiza classificação
        timeA.golsPro += golsA; timeA.golsContra += golsB;
        timeB.golsPro += golsB; timeB.golsContra += golsA;
        timeA.saldo = timeA.golsPro - timeA.golsContra;
        timeB.saldo = timeB.golsPro - timeB.golsContra;
        if (golsA > golsB) { timeA.pontos += 3; timeA.vitorias++; timeB.derrotas++; }
        else if (golsA < golsB) { timeB.pontos += 3; timeB.vitorias++; timeA.derrotas++; }
        else { timeA.pontos++; timeB.pontos++; timeA.empates++; timeB.empates++; }
        // Histórico
        timeA.historico.push({ adv: timeB.nome, g: golsA, gc: golsB, rodada: campeonato.rodadaAtual });
        timeB.historico.push({ adv: timeA.nome, g: golsB, gc: golsA, rodada: campeonato.rodadaAtual });
        // Estatísticas detalhadas
        return {
            timeA: timeA.nome, escudoA: timeA.escudo, golA: golsA, timeB: timeB.nome, escudoB: timeB.escudo, golB: golsB,
            posseA: Math.round(posseA*100), posseB: Math.round(posseB*100),
            finalizA, finalizB,
            tempoGolsA, tempoGolsB,
            artilheirosA, artilheirosB
        };
    }

    const rodada = campeonato.calendario[campeonato.rodadaAtual];
    let resultados = [];
    rodada.forEach(([idA, idB]) => {
        const timeA = campeonato.times[idA];
        const timeB = campeonato.times[idB];
        resultados.push(simularJogo(timeA, timeB));
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
    // Botão avançar semana SEMPRE chama jogarProximaRodadaUI
    const btnAvancar = document.getElementById('btn-avancar-semana');
    if (btnAvancar) btnAvancar.onclick = () => jogarProximaRodadaUI();
}

function gerarElencoFicticio() {
    // Gera elenco com tamanho entre 15 e 20 (11 titulares padrão + reservas)
    const nomes = ['João','Carlos','Lucas','Pedro','Rafael','Bruno','André','Felipe','Marcos','Gustavo','Eduardo','Thiago','Daniel','Vitor','Gabriel','Fernando','Hugo','Leandro','Roberto','Igor','Samuel','Diego','Mateus','Ricardo','Paulo','Nelson','Breno','César','Rafa'];
    const elenco = [];
    function push(nome, posDet, pos, idade, energia, status, valor) { elenco.push({ nome, posDetalhada: posDet, pos, idade, energia, status, valor }); }

    // Formação base 4-4-2 para titulares
    // 1 Goleiro titular
    push(nomes.shift()||'Goleiro1','GOL','GOL',28,90,'Titular',3000000);
    // 1 Goleiro reserva
    push(nomes.shift()||'Goleiro2','GOL','GOL',31,85,'Reserva',1500000);

    // Titulares: 4 defensores, 4 meias, 2 atacantes
    const defsTit = ['LD','LE','ZAG','ZAG'];
    defsTit.forEach((d,i)=> push(nomes.shift()||`DefT${i+1}`, d, 'DEF', 22 + (i%8), 80 + Math.floor(Math.random()*15), 'Titular', 1500000 + Math.floor(Math.random()*2000000)));
    const meisTit = ['VOL','MEI','MEI','MEA'];
    meisTit.forEach((m,i)=> push(nomes.shift()||`MeiT${i+1}`, m, 'MEI', 21 + (i%8), 78 + Math.floor(Math.random()*17), 'Titular', 1500000 + Math.floor(Math.random()*2500000)));
    const atasTit = ['CA','CA'];
    atasTit.forEach((a,i)=> push(nomes.shift()||`AtaT${i+1}`, a, 'ATA', 20 + (i%8), 80 + Math.floor(Math.random()*15), 'Titular', 2000000 + Math.floor(Math.random()*3000000)));

    // Agora preenche reservas até desiredTotal (entre 15 e 20)
    const desiredTotal = 15 + Math.floor(Math.random()*6); // 15..20
    const posPool = ['DEF','MEI','ATA'];
    while (elenco.length < desiredTotal) {
        const n = nomes.shift() || `Jog${elenco.length+1}`;
        const pos = posPool[Math.floor(Math.random()*posPool.length)];
        const posDet = pos === 'DEF' ? 'ZAG' : (pos === 'MEI' ? 'MEI' : 'CA');
        push(n, posDet, pos, 20 + Math.floor(Math.random()*12), 70 + Math.floor(Math.random()*25), 'Reserva', 700000 + Math.floor(Math.random()*2500000));
    }

    // Garantias simples: pelo menos 15 jogadores e no máximo 20
    if (elenco.length < 15) {
        let idx = 0;
        while (elenco.length < 15) {
            elenco.push({ nome:`Jog${elenco.length+1}`, posDetalhada:'MEI', pos:'MEI', idade:20+idx, energia:75, status:'Reserva', valor:700000 });
            idx++;
        }
    }
    if (elenco.length > 20) elenco.length = 20;

    return elenco;
}

// Render elenco com filtros e ações rápidas
function renderElenco(elenco) {
    const center = document.getElementById('main-center');
    center.innerHTML = '';
    // controls
    const actionsBar = document.createElement('div');
    actionsBar.style.display = 'flex'; actionsBar.style.justifyContent = 'space-between'; actionsBar.style.marginBottom = '12px';
    const left = document.createElement('div');
    const right = document.createElement('div');
    const btnAuto = document.createElement('button'); btnAuto.className = 'elenco-acao-btn'; btnAuto.textContent = 'Escalar Melhor Time';
    btnAuto.onclick = () => escalonarMelhorTime(elenco);
    left.appendChild(btnAuto);
    actionsBar.appendChild(left);
    actionsBar.appendChild(right);
    center.appendChild(actionsBar);

    // Selector de formação
    const formacoesDisponiveis = {
        '4-4-2': { DEF:4, MEI:4, ATA:2, GOL:1 },
        '4-3-3': { DEF:4, MEI:3, ATA:3, GOL:1 },
        '3-5-2': { DEF:3, MEI:5, ATA:2, GOL:1 },
        '4-2-3-1': { DEF:4, MEI:5, ATA:1, GOL:1 }
    };
    const selForm = document.createElement('select'); selForm.style.marginLeft = '12px';
    Object.keys(formacoesDisponiveis).forEach(f=>{ const o = document.createElement('option'); o.value=f; o.textContent=f; selForm.appendChild(o); });
    // tenta ler do campeonato
    const camp = carregarCampeonato();
    if (camp && camp.formacao) selForm.value = camp.formacao;
    selForm.onchange = () => { if (camp) { camp.formacao = selForm.value; salvarCampeonato(camp); renderElenco(elenco); } };
    right.appendChild(selForm);

    const container = document.createElement('div'); container.className = 'elenco-container';
    // Separar titulares e reservas
    const titulares = elenco.filter(j => j.status && j.status.toLowerCase().includes('titul'));
    const reservas = elenco.filter(j => !j.status || !j.status.toLowerCase().includes('titul'));

    const boxTit = document.createElement('div'); boxTit.className = 'elenco-box';
    boxTit.innerHTML = `<h3>Titulares</h3><div id='titulares-list'></div>`;
    const boxRes = document.createElement('div'); boxRes.className = 'elenco-box';
    boxRes.innerHTML = `<h3>Reservas</h3><div id='reservas-list'></div>`;

    container.appendChild(boxTit); container.appendChild(boxRes);
    center.appendChild(container);

    function contarTitularesPorPosicao() {
        const cnt = { GOL:0, DEF:0, MEI:0, ATA:0 };
        elenco.forEach(p=>{ if (p.status && p.status.toLowerCase().includes('titul')) cnt[p.pos] = (cnt[p.pos]||0)+1; });
        return cnt;
    }

    function formacaoAtualLimits() {
        const f = (camp && camp.formacao) ? camp.formacao : Object.keys(formacoesDisponiveis)[0];
        return formacoesDisponiveis[f];
    }

    function renderPlayerRow(player, containerEl, isTitular) {
        const row = document.createElement('div'); row.className = 'player-row';
        row.draggable = true;
        row.dataset.playerName = player.nome;
        row.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData('text/plain', player.nome);
        });
        row.innerHTML = `
            <div style='width:36px;text-align:center;'>${player.escudo||''}</div>
            <div class='player-name'>${player.nome}</div>
            <div class='player-pos'>${player.posDetalhada||player.pos}</div>
            <div class='player-age'>${player.idade}</div>
            <div class='player-energy'><div class='energy-bar ${player.energia<60?"energy-low":""}'><i style='width:${Math.max(6,player.energia)}%'></i></div></div>
            <div class='player-value'>R$ ${player.valor.toLocaleString('pt-BR')}</div>
            <div class='player-actions'></div>
        `;
        const actions = row.querySelector('.player-actions');
        // Escalar / Enviar para reserva
        const btnToggle = document.createElement('button'); btnToggle.className='elenco-acao-btn';
        btnToggle.textContent = isTitular ? 'Enviar para reserva' : 'Colocar como titular';
        btnToggle.onclick = () => {
            // validações
            const limits = formacaoAtualLimits();
            const cnt = contarTitularesPorPosicao();
            if (!isTitular) {
                // tentando promover para titular
                if (player.pos === 'GOL' && (cnt.GOL || 0) >= (limits.GOL||1)) { alert('Já existe goleiro titular. Remova antes.'); return; }
                if (player.pos === 'DEF' && (cnt.DEF || 0) >= (limits.DEF||4)) { alert('Máximo de defensores titulares atingido para a formação.'); return; }
                if (player.pos === 'MEI' && (cnt.MEI || 0) >= (limits.MEI||3)) { alert('Máximo de meias titulares atingido para a formação.'); return; }
                if (player.pos === 'ATA' && (cnt.ATA || 0) >= (limits.ATA||2)) { alert('Máximo de atacantes titulares atingido para a formação.'); return; }
            } else {
                // enviar para reserva sempre é permitido
            }
            player.status = isTitular ? 'Reserva' : 'Titular';
            salvarAlteracoesElenco(player);
            renderElenco(elenco);
        };
        actions.appendChild(btnToggle);
        // Substituir - apenas em titulares
        if (isTitular) {
            const btnSub = document.createElement('button'); btnSub.className='elenco-acao-btn secondary'; btnSub.textContent='Substituir';
            btnSub.onclick = (e) => abrirPopupSubstituicao(e, player);
            actions.appendChild(btnSub);
        }
        // Vender
        const btnSell = document.createElement('button'); btnSell.className='elenco-acao-btn secondary'; btnSell.textContent='Vender';
        btnSell.onclick = () => abrirPropostasVenda(player);
        actions.appendChild(btnSell);
        // Renovar
        const btnRen = document.createElement('button'); btnRen.className='elenco-acao-btn secondary'; btnRen.textContent='Renovar';
        btnRen.onclick = () => renovarContrato(player);
        actions.appendChild(btnRen);

        containerEl.appendChild(row);
    }

    const titList = boxTit.querySelector('#titulares-list'); titList.innerHTML='';
    titulares.forEach(p => renderPlayerRow(p, titList, true));
    const resList = boxRes.querySelector('#reservas-list'); resList.innerHTML='';
    reservas.forEach(p=> renderPlayerRow(p, resList, false));

    // Drag and drop targets
    [titList, resList].forEach(list => {
        list.addEventListener('dragover', (e)=>{ e.preventDefault(); list.style.outline='2px dashed rgba(255,255,255,0.06)'; });
        list.addEventListener('dragleave', ()=>{ list.style.outline='none'; });
        list.addEventListener('drop', (e)=>{
            e.preventDefault(); list.style.outline='none';
            const nome = e.dataTransfer.getData('text/plain');
            const player = elenco.find(p=>p.nome===nome);
            if (!player) return;
            const isDroppingToTit = list.id === 'titulares-list';
            // Simula clique no toggle para reaplicar validações
            const limits = formacaoAtualLimits();
            const cnt = contarTitularesPorPosicao();
            if (isDroppingToTit && !player.status.toLowerCase().includes('titul')) {
                if (player.pos === 'GOL' && (cnt.GOL || 0) >= (limits.GOL||1)) { alert('Já existe goleiro titular. Remova antes.'); return; }
                if (player.pos === 'DEF' && (cnt.DEF || 0) >= (limits.DEF||4)) { alert('Máximo de defensores titulares atingido para a formação.'); return; }
                if (player.pos === 'MEI' && (cnt.MEI || 0) >= (limits.MEI||3)) { alert('Máximo de meias titulares atingido para a formação.'); return; }
                if (player.pos === 'ATA' && (cnt.ATA || 0) >= (limits.ATA||2)) { alert('Máximo de atacantes titulares atingido para a formação.'); return; }
                player.status='Titular';
            } else if (!isDroppingToTit && player.status.toLowerCase().includes('titul')) {
                player.status='Reserva';
            }
            salvarAlteracoesElenco(player);
            renderElenco(elenco);
        });
    });

    // Substituição popup
    function abrirPopupSubstituicao(evt, titular) {
        // fecha popups existentes
        document.querySelectorAll('.substitute-popup').forEach(n=>n.remove());
        const rect = evt.target.getBoundingClientRect();
        const popup = document.createElement('div'); popup.className='substitute-popup';
        popup.style.top = (rect.bottom + window.scrollY + 6) + 'px';
        popup.style.left = (rect.left + window.scrollX) + 'px';
        const pos = titular.posDetalhada || titular.pos;
        const candidatos = elenco.filter(j => (!j.status || !j.status.toLowerCase().includes('titul')) && j.pos === titular.pos);
        if (candidatos.length===0) {
            popup.innerHTML = `<div style='padding:6px;color:#ddd'>Nenhum reserva disponível para posição ${pos}</div>`;
        } else {
            popup.innerHTML = `<div style='padding:6px;color:#fff;font-weight:700'>Substituir ${titular.nome}</div>`;
            candidatos.forEach(c=>{
                const sub = document.createElement('div'); sub.className='sub-row';
                sub.innerHTML = `<div>${c.nome} (${c.pos})</div><div><button class='elenco-acao-btn'>Entrar</button></div>`;
                sub.querySelector('button').onclick = () => {
                    // troca
                    titular.status='Reserva'; c.status='Titular'; salvarAlteracoesElenco(titular); salvarAlteracoesElenco(c); popup.remove(); renderElenco(elenco);
                };
                popup.appendChild(sub);
            });
        }
        document.body.appendChild(popup);
    }

    function abrirPropostasVenda(player) {
        const offers = [Math.round(player.valor*0.5), Math.round(player.valor*0.75), Math.round(player.valor*0.9)];
        const choice = prompt(`Propostas para vender ${player.nome}: \n1) R$ ${offers[0].toLocaleString()} \n2) R$ ${offers[1].toLocaleString()} \n3) R$ ${offers[2].toLocaleString()} \nDigite 1,2 ou 3 para aceitar (ou cancelar) `);
        if (choice && ['1','2','3'].includes(choice.trim())) {
            const val = offers[parseInt(choice.trim())-1];
            // remove jogador
            const idx = elenco.findIndex(x=>x.nome===player.nome && x.pos===player.pos);
            if (idx>=0) elenco.splice(idx,1);
            // adiciona saldo ao save
            const save = carregarSave(); save.data.saldo = (save.data.saldo||0) + val; salvarSave(save);
            alert(`${player.nome} vendido por R$ ${val.toLocaleString()}`);
            renderElenco(elenco);
        }
    }

    function renovarContrato(player) {
        const anos = prompt(`Renovar contrato de ${player.nome}. Anos adicionais:`,'1');
        const anosN = parseInt(anos||'0');
        if (anosN>0) {
            player.contrato = (player.contrato||0) + anosN;
            alert(`Contrato renovado por ${anosN} anos.`);
            salvarAlteracoesElenco(player);
            renderElenco(elenco);
        }
    }

    // fechar popups ao clicar fora
    document.addEventListener('click', function(ev){
        if (!ev.target.closest('.substitute-popup') && !ev.target.closest('.player-actions')) {
            document.querySelectorAll('.substitute-popup').forEach(n=>n.remove());
        }
    });
}

function salvarAlteracoesElenco(player) {
    // salva no campeonato atual
    const camp = carregarCampeonato();
    if (!camp) return;
    const time = camp.times[camp.meuTimeId];
    const idx = time.jogadores.findIndex(j=>j.nome===player.nome && j.pos===player.pos);
    if (idx>=0) time.jogadores[idx] = player;
    salvarCampeonato(camp);
}

function escalonarMelhorTime(elenco) {
    // Simples: escolhe por posição o jogador com maior (energia + valor/1000000)
    const posGroups = {};
    elenco.forEach(p => {
        const pos = p.pos;
        if (!posGroups[pos]) posGroups[pos]=[];
        posGroups[pos].push(p);
    });
    Object.keys(posGroups).forEach(pos => {
        // sort desc
        posGroups[pos].sort((a,b)=>((b.energia||0)+(b.valor||0)/1000000)-((a.energia||0)+(a.valor||0)/1000000));
        // first N become titulares (N depends on pos: e.g., DEF 4, MEI 4, ATA 2, GOL 1)
        let slots = 0;
        if (pos==='GOL') slots=1; else if (pos==='DEF') slots=4; else if (pos==='MEI') slots=4; else if (pos==='ATA') slots=2; else slots=2;
        posGroups[pos].forEach((p,i)=> p.status = i<slots ? 'Titular' : 'Reserva');
    });
    // Salva alterações
    const camp = carregarCampeonato(); if (!camp) return; camp.times[camp.meuTimeId].jogadores = elenco; salvarCampeonato(camp);
    renderElenco(elenco);
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
