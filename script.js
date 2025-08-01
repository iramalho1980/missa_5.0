// Dados dos cânticos organizados por pasta
const canticosPorPasta = {
    "Aclamação": [
        "a vossa palavra senhor.jpeg",
        "a_minhalma_abrirei.pdf",
        "a_vossa_palavra_senhor.pdf",
        "aleluia_como_o_pai_me_amou.pdf",
        "buscai_primeiro_o_reino_de_deus.pdf",
        "como_sao_belos.pdf",
        "eu_vim_para_escutar.pdf",
        "palavra_de_salvacao.pdf",
        "que_alegria_cristo_ressurgiu.pdf",
        "vai_falar_no_evangelho.pdf",
        "vinde_espirito_de_deus.pdf"
    ],
    "Adoração": [],
    "Ato Penitencial": [
        "Eu confesso a Deus.jpeg",
        "conheco_um_coracao.pdf",
        "coracoes_arrependidos.pdf",
        "kyrie_eleison_jmj.pdf",
        "pelos_pecados_senhor_piedade_de_nos.pdf",
        "perdao_senhor.pdf",
        "renovame.pdf",
        "senhor que viestes salvar.jpeg",
        "senhor_que_viestes_salvar_kirie_elleisson.pdf",
        "senhor_tende_piedade_de_nos.pdf",
        "senhor_tende_piedade_perdoai_nossa_culpa.pdf"
    ],
    "Campanha da Fraternidade": [],
    "Comunhão": [],
    "Cordeiro": [
        "cordeiro de deus.pdf"
    ],
    "Entrada": [
        "Entrada - Creio.jpeg",
        "a_biblia_e_a_palavra_de_deus.pdf",
        "bom_pastor.pdf",
        "coração_santo.pdf",
        "cristo_ressucitou_aleluia.pdf",
        "deixa_a_luz_do_ceu_entrar.pdf",
        "eis_me_aqui_senhor.pdf",
        "esatremos_aqui_reunidos.pdf",
        "estaremos_aqui_reunidos.pdf",
        "eu e minha casa serviremos ao senhor.pdf",
        "faco_novas_todas_as_coisas.pdf",
        "hosana_hey_hosana_ha.pdf",
        "oh senhor nós estamos aqui.jpeg",
        "por entre aclamações.pdf",
        "por_sua_morte.pdf",
        "porque_ele_vive.pdf",
        "senhor_quem_entrara.pdf",
        "te_amarei.pdf",
        "toda_biblia_e_comunicacao.pdf",
        "tu_es_a_razao_da_jornada.pdf",
        "vamos celebrar.pdf",
        "vem_louvar.pdf"
    ],
    "Final": [
        "Mostra-me senhor.jpeg",
        "a_alegria_esta_no_coracao.pdf",
        "anjos_de_deus.pdf",
        "como_o_pai_me_enviou.pdf",
        "cristo_eh_a_felicidade.pdf",
        "deixa_luz_do_ceu_entrar.pdf",
        "hoje_e_tempo_de_louvar.pdf",
        "pelas_estradas_da_vida.pdf",
        "segura_na_mao_de_deus.pdf",
        "tomado_pela_mao.pdf",
        "tu_es_razao_jornada.pdf"
    ],
    "Gloria": [
        "Gloria a Deus.jpeg",
        "a_ele_seja_a_gloria.pdf",
        "gloria_a_deus_nas_alturas.pdf",
        "gloria_a_deus_nas_alturas__rock_balada.pdf",
        "gloria_ao_pai_criador.pdf"
    ],
    "Maria": [
        "a_escolhida.pdf",
        "ave_cheia_de_graca.pdf",
        "imaculada_maria_de_deus.pdf",
        "maria_de_nazare.pdf",
        "santa_mae_maria.pdf",
        "santa_maria_vem.pdf"
    ],
    "Natal": [],
    "Novena": [],
    "Ofertório": [
        "a_mesa_santa_que_preparamos.pdf",
        "de_maos_estendidas.pdf",
        "meu_coracao_eh_para_ti.pdf",
        "minha_vida_tem_sentido.pdf",
        "muitos_graos_de_trigo.pdf",
        "ofertas_singelas.pdf",
        "os dons que trago aqui.jpeg",
        "sabes_senhor.pdf",
        "um_coracao_para_amar.pdf"
    ],
    "Paz": [],
    "Quaresma": [],
    "Santo": [
        "Nosso Deus senhor é santo.jpeg",
        "hosana_eh.pdf",
        "hosana_no_alto_ceu.pdf",
        "o_senhor_eh_santo.pdf",
        "santo santo é o senhor.jpeg",
        "santo_santo_e.pdf"
    ],
    "Terço": []
};

// Tipos de cânticos para missa
const tiposCantico = [
    "Entrada",
    "Ato Penitencial", 
    "Gloria",
    "Aclamação",
    "Santo",
    "Cordeiro",
    "Comunhão",
    "Final",
    "Ofertório",
    "Paz"
];

// Estado da aplicação
let ordemMissa = [];
let draggedElement = null;

// Elementos DOM
const pastaSelect = document.getElementById('pasta-select');
const canticoSelect = document.getElementById('cantico-select');
const adicionarBtn = document.getElementById('adicionar-btn');
const ordemMissaDiv = document.getElementById('ordem-missa');
const loading = document.getElementById('loading');
const popupOverlay = document.getElementById('popup-overlay');
const popupTitle = document.getElementById('popup-title');
const letraFrame = document.getElementById('letra-frame');
const closePopup = document.getElementById('close-popup');
const toast = document.getElementById('toast');
const salvarBtn = document.getElementById('salvar-btn');
const carregarBtn = document.getElementById('carregar-btn');
const limparBtn = document.getElementById('limpar-btn');
const fileInput = document.getElementById('file-input');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    carregarListaSalva();
});

function setupEventListeners() {
    // Seleção de pasta
    pastaSelect.addEventListener('change', function() {
        const pastaSelecionada = this.value;
        carregarCanticos(pastaSelecionada);
    });

    // Seleção de cântico
    canticoSelect.addEventListener('change', function() {
        adicionarBtn.disabled = !this.value;
    });

    // Adicionar cântico
    adicionarBtn.addEventListener('click', adicionarCantico);

    // Controles
    salvarBtn.addEventListener('click', salvarLista);
    carregarBtn.addEventListener('click', () => fileInput.click());
    limparBtn.addEventListener('click', limparTudo);
    fileInput.addEventListener('change', carregarLista);

    // Popup
    closePopup.addEventListener('click', fecharPopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            fecharPopup();
        }
    });

    // Drag and drop na ordem da missa
    ordemMissaDiv.addEventListener('dragover', handleDragOver);
    ordemMissaDiv.addEventListener('drop', handleDrop);
}

function carregarCanticos(pasta) {
    if (!pasta) {
        canticoSelect.innerHTML = '<option value="">Primeiro selecione uma pasta...</option>';
        canticoSelect.disabled = true;
        adicionarBtn.disabled = true;
        return;
    }

    loading.classList.add('show');
    
    // Simular carregamento
    setTimeout(() => {
        const canticos = canticosPorPasta[pasta] || [];
        
        canticoSelect.innerHTML = '<option value="">Selecione um cântico...</option>';
        
        if (canticos.length === 0) {
            canticoSelect.innerHTML += '<option value="" disabled>Nenhum cântico disponível</option>';
        } else {
            canticos.forEach(cantico => {
                const nomeFormatado = formatarNomeCantico(cantico);
                canticoSelect.innerHTML += `<option value="${cantico}">${nomeFormatado}</option>`;
            });
        }
        
        canticoSelect.disabled = canticos.length === 0;
        loading.classList.remove('show');
    }, 500);
}

function formatarNomeCantico(nomeArquivo) {
    return nomeArquivo
        .replace(/\.(pdf|jpeg|jpg)$/i, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function adicionarCantico() {
    const pasta = pastaSelect.value;
    const cantico = canticoSelect.value;
    
    if (!pasta || !cantico) {
        mostrarToast('Selecione uma pasta e um cântico', 'error');
        return;
    }

    const novoCantico = {
        id: Date.now(),
        nome: formatarNomeCantico(cantico),
        arquivo: cantico,
        pasta: pasta,
        tipo: sugerirTipoCantico(pasta)
    };

    ordemMissa.push(novoCantico);
    renderizarOrdemMissa();
    salvarAutomatico();
    
    mostrarToast('Cântico adicionado com sucesso!');
    
    // Reset seleções
    canticoSelect.value = '';
    adicionarBtn.disabled = true;
}

function sugerirTipoCantico(pasta) {
    const mapeamento = {
        'Entrada': 'Entrada',
        'Ato Penitencial': 'Ato Penitencial',
        'Gloria': 'Gloria',
        'Aclamação': 'Aclamação',
        'Santo': 'Santo',
        'Cordeiro': 'Cordeiro',
        'Comunhão': 'Comunhão',
        'Final': 'Final',
        'Ofertório': 'Ofertório',
        'Paz': 'Paz'
    };
    
    return mapeamento[pasta] || 'Entrada';
}

function renderizarOrdemMissa() {
    if (ordemMissa.length === 0) {
        ordemMissaDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-hand-point-up" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>Adicione cânticos aqui</p>
                <p>Arraste para reordenar</p>
            </div>
        `;
        return;
    }

    ordemMissaDiv.innerHTML = ordemMissa.map((cantico, index) => `
        <div class="cantico-item" draggable="true" data-id="${cantico.id}">
            <div class="cantico-header">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span class="cantico-nome" onclick="abrirLetra('${cantico.pasta}', '${cantico.arquivo}', '${cantico.nome}')">
                    ${cantico.nome}
                </span>
                <div class="cantico-actions">
                    <button class="btn-small btn-delete" onclick="removerCantico(${cantico.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="tipo-cantico">
                <label style="color: #666; font-size: 0.9rem; margin-bottom: 0;">Tipo:</label>
                <select class="tipo-select" onchange="alterarTipoCantico(${cantico.id}, this.value)">
                    ${tiposCantico.map(tipo => 
                        `<option value="${tipo}" ${tipo === cantico.tipo ? 'selected' : ''}>${tipo}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners para drag and drop
    document.querySelectorAll('.cantico-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function alterarTipoCantico(id, novoTipo) {
    const cantico = ordemMissa.find(c => c.id === id);
    if (cantico) {
        cantico.tipo = novoTipo;
        salvarAutomatico();
        mostrarToast('Tipo alterado com sucesso!');
    }
}

function removerCantico(id) {
    ordemMissa = ordemMissa.filter(c => c.id !== id);
    renderizarOrdemMissa();
    salvarAutomatico();
    mostrarToast('Cântico removido!');
}

function abrirLetra(pasta, arquivo, nome) {
    const url = `./Letras/${encodeURIComponent(pasta)}/${encodeURIComponent(arquivo)}`;
    
    popupTitle.textContent = nome;
    letraFrame.src = url;
    popupOverlay.style.display = 'block';
    
    // Adicionar classe para animação
    setTimeout(() => {
        popupOverlay.style.opacity = '1';
    }, 10);
}

function fecharPopup() {
    popupOverlay.style.opacity = '0';
    setTimeout(() => {
        popupOverlay.style.display = 'none';
        letraFrame.src = '';
    }, 300);
}

// Drag and Drop
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    ordemMissaDiv.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    ordemMissaDiv.classList.remove('drag-over');
    
    if (draggedElement) {
        const draggedId = parseInt(draggedElement.dataset.id);
        const dropTarget = e.target.closest('.cantico-item');
        
        if (dropTarget && dropTarget !== draggedElement) {
            const targetId = parseInt(dropTarget.dataset.id);
            reordenarCanticos(draggedId, targetId);
        }
    }
}

function reordenarCanticos(draggedId, targetId) {
    const draggedIndex = ordemMissa.findIndex(c => c.id === draggedId);
    const targetIndex = ordemMissa.findIndex(c => c.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = ordemMissa.splice(draggedIndex, 1);
        ordemMissa.splice(targetIndex, 0, draggedItem);
        
        renderizarOrdemMissa();
        salvarAutomatico();
        mostrarToast('Ordem alterada!');
    }
}

// Salvar e Carregar
function salvarLista() {
    const dados = {
        ordemMissa: ordemMissa,
        dataExportacao: new Date().toISOString(),
        versao: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordem-missa-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    mostrarToast('Lista salva com sucesso!');
}

function carregarLista(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.ordemMissa && Array.isArray(dados.ordemMissa)) {
                ordemMissa = dados.ordemMissa;
                renderizarOrdemMissa();
                salvarAutomatico();
                mostrarToast('Lista carregada com sucesso!');
            } else {
                throw new Error('Formato inválido');
            }
        } catch (error) {
            mostrarToast('Erro ao carregar arquivo', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

function limparTudo() {
    if (ordemMissa.length === 0) {
        mostrarToast('Lista já está vazia', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja limpar toda a lista?')) {
        ordemMissa = [];
        renderizarOrdemMissa();
        salvarAutomatico();
        mostrarToast('Lista limpa!');
    }
}

function salvarAutomatico() {
    localStorage.setItem('ordemMissa', JSON.stringify(ordemMissa));
}

function carregarListaSalva() {
    const dadosSalvos = localStorage.getItem('ordemMissa');
    if (dadosSalvos) {
        try {
            ordemMissa = JSON.parse(dadosSalvos);
            renderizarOrdemMissa();
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
}

// Utilitários
function mostrarToast(mensagem, tipo = 'success') {
    toast.textContent = mensagem;
    toast.className = `toast ${tipo}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popupOverlay.style.display === 'block') {
        fecharPopup();
    }
});

// Responsividade para touch devices
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

