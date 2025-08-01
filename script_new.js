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
let canticosPorPasta = {}; // Será carregado dinamicamente

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
    carregarPastasDisponiveis();
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

// Função para carregar pastas disponíveis dinamicamente
async function carregarPastasDisponiveis() {
    try {
        // Lista de pastas conhecidas (fallback)
        const pastasConhecidas = [
            "Aclamação", "Adoração", "Ato Penitencial", "Campanha da Fraternidade",
            "Comunhão", "Cordeiro", "Entrada", "Final", "Gloria", "Maria",
            "Natal", "Novena", "Ofertório", "Paz", "Quaresma", "Santo", "Terço"
        ];

        // Limpar select de pastas
        pastaSelect.innerHTML = '<option value="">Escolha uma pasta...</option>';

        // Verificar quais pastas existem e têm conteúdo
        for (const pasta of pastasConhecidas) {
            try {
                const canticos = await carregarCanticosDaPasta(pasta);
                if (canticos && canticos.length > 0) {
                    canticosPorPasta[pasta] = canticos;
                    const option = document.createElement('option');
                    option.value = pasta;
                    option.textContent = pasta;
                    pastaSelect.appendChild(option);
                }
            } catch (error) {
                console.log(`Pasta ${pasta} não encontrada ou vazia`);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar pastas:', error);
        mostrarToast('Erro ao carregar pastas disponíveis', 'error');
    }
}

// Função para carregar cânticos de uma pasta específica
async function carregarCanticosDaPasta(pasta) {
    try {
        const response = await fetch(`./Letras/${encodeURIComponent(pasta)}/`);
        if (!response.ok) {
            throw new Error(`Pasta ${pasta} não encontrada`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extrair links de arquivos (PDF, JPEG, JPG, PNG)
        const links = doc.querySelectorAll('a[href]');
        const arquivos = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.endsWith('.pdf') || href.endsWith('.jpeg') || 
                        href.endsWith('.jpg') || href.endsWith('.png'))) {
                // Decodificar o nome do arquivo
                const nomeArquivo = decodeURIComponent(href);
                arquivos.push(nomeArquivo);
            }
        });
        
        return arquivos;
    } catch (error) {
        // Fallback: tentar carregar arquivo individual para verificar se pasta existe
        const arquivosComuns = [
            'index.html', 'README.md', '.gitkeep'
        ];
        
        for (const arquivo of arquivosComuns) {
            try {
                const testResponse = await fetch(`./Letras/${encodeURIComponent(pasta)}/${arquivo}`);
                if (testResponse.ok) {
                    // Pasta existe, mas não conseguimos listar arquivos
                    // Retornar array vazio para indicar que pasta existe
                    return [];
                }
            } catch (e) {
                // Continuar tentando
            }
        }
        
        throw error;
    }
}

function carregarCanticos(pasta) {
    if (!pasta) {
        canticoSelect.innerHTML = '<option value="">Primeiro selecione uma pasta...</option>';
        canticoSelect.disabled = true;
        adicionarBtn.disabled = true;
        return;
    }

    loading.classList.add('show');
    
    // Usar dados já carregados ou tentar carregar novamente
    const canticos = canticosPorPasta[pasta];
    
    if (canticos) {
        preencherSelectCanticos(canticos);
    } else {
        // Tentar carregar dinamicamente
        carregarCanticosDaPasta(pasta)
            .then(canticos => {
                canticosPorPasta[pasta] = canticos;
                preencherSelectCanticos(canticos);
            })
            .catch(error => {
                console.error(`Erro ao carregar cânticos da pasta ${pasta}:`, error);
                canticoSelect.innerHTML = '<option value="" disabled>Erro ao carregar cânticos</option>';
                canticoSelect.disabled = true;
                mostrarToast(`Erro ao carregar cânticos da pasta ${pasta}`, 'error');
            })
            .finally(() => {
                loading.classList.remove('show');
            });
    }
}

function preencherSelectCanticos(canticos) {
    canticoSelect.innerHTML = '<option value="">Selecione um cântico...</option>';
    
    if (canticos.length === 0) {
        canticoSelect.innerHTML += '<option value="" disabled>Nenhum cântico disponível</option>';
        canticoSelect.disabled = true;
    } else {
        canticos.forEach(cantico => {
            const nomeFormatado = formatarNomeCantico(cantico);
            canticoSelect.innerHTML += `<option value="${cantico}">${nomeFormatado}</option>`;
        });
        canticoSelect.disabled = false;
    }
    
    loading.classList.remove('show');
}

function formatarNomeCantico(nomeArquivo) {
    return nomeArquivo
        .replace(/\.(pdf|jpeg|jpg|png)$/i, '')
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
    const letraContainer = document.getElementById('letra-container');
    const letraFrame = document.getElementById('letra-frame');
    const letraImage = document.getElementById('letra-image');
    
    popupTitle.textContent = nome;
    
    // Detectar se é imagem ou PDF
    const isImage = /\.(jpeg|jpg|png|gif|bmp|webp)$/i.test(arquivo);
    
    if (isImage) {
        // Exibir como imagem
        letraFrame.style.display = 'none';
        letraImage.style.display = 'block';
        letraImage.src = url;
        letraContainer.classList.add('image-container');
        
        // Aguardar carregamento da imagem para ajustar o popup
        letraImage.onload = function() {
            ajustarPopupParaDispositivo(this);
        };
    } else {
        // Exibir como PDF no iframe
        letraImage.style.display = 'none';
        letraFrame.style.display = 'block';
        letraFrame.src = url;
        letraContainer.classList.remove('image-container');
        
        ajustarPopupParaDispositivo();
    }
    
    popupOverlay.style.display = 'block';
    
    // Adicionar classe para animação
    setTimeout(() => {
        popupOverlay.style.opacity = '1';
    }, 10);
}

// Função para ajustar popup especificamente para dispositivos iOS
function ajustarPopupParaDispositivo(imagem = null) {
    const popupContent = document.querySelector('.popup-content');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = window.innerWidth <= 768;
    
    // Reset estilos
    popupContent.style.maxWidth = '';
    popupContent.style.maxHeight = '';
    popupContent.style.width = '';
    popupContent.style.height = '';
    
    if (isIOS || isMobile) {
        // Configurações específicas para iOS e dispositivos móveis
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Usar quase toda a tela em dispositivos móveis
        popupContent.style.maxWidth = '95vw';
        popupContent.style.maxHeight = '95vh';
        popupContent.style.width = '95vw';
        
        if (imagem) {
            // Para imagens, ajustar baseado no tamanho da imagem
            const aspectRatio = imagem.naturalWidth / imagem.naturalHeight;
            const maxImageHeight = viewportHeight * 0.8; // 80% da altura da tela
            const maxImageWidth = viewportWidth * 0.9; // 90% da largura da tela
            
            let finalWidth, finalHeight;
            
            if (imagem.naturalWidth > maxImageWidth || imagem.naturalHeight > maxImageHeight) {
                // Redimensionar mantendo proporção
                if (aspectRatio > 1) {
                    // Imagem mais larga que alta
                    finalWidth = Math.min(maxImageWidth, imagem.naturalWidth);
                    finalHeight = finalWidth / aspectRatio;
                } else {
                    // Imagem mais alta que larga
                    finalHeight = Math.min(maxImageHeight, imagem.naturalHeight);
                    finalWidth = finalHeight * aspectRatio;
                }
            } else {
                finalWidth = imagem.naturalWidth;
                finalHeight = imagem.naturalHeight;
            }
            
            imagem.style.width = finalWidth + 'px';
            imagem.style.height = finalHeight + 'px';
            imagem.style.maxWidth = '100%';
            imagem.style.maxHeight = '80vh';
            imagem.style.objectFit = 'contain';
        }
        
        // Ajustar altura do popup para iOS
        popupContent.style.height = 'auto';
        popupContent.style.maxHeight = '95vh';
        popupContent.style.overflow = 'auto';
        
        // Configuração específica para iOS para evitar problemas de viewport
        if (isIOS) {
            popupContent.style.position = 'fixed';
            popupContent.style.top = '2.5vh';
            popupContent.style.left = '2.5vw';
            popupContent.style.transform = 'none';
            popupContent.style.webkitOverflowScrolling = 'touch';
        }
    } else {
        // Desktop - configurações originais
        if (imagem) {
            const maxWidth = Math.min(window.innerWidth * 0.9, imagem.naturalWidth + 100);
            const maxHeight = Math.min(window.innerHeight * 0.9, imagem.naturalHeight + 150);
            
            popupContent.style.maxWidth = maxWidth + 'px';
            popupContent.style.maxHeight = maxHeight + 'px';
            
            if (imagem.naturalHeight > window.innerHeight * 0.7) {
                imagem.style.maxHeight = (window.innerHeight * 0.7) + 'px';
                imagem.style.width = 'auto';
            }
        } else {
            popupContent.style.maxWidth = '90vw';
            popupContent.style.maxHeight = '90vh';
        }
    }
}

function fecharPopup() {
    const letraContainer = document.getElementById('letra-container');
    const letraFrame = document.getElementById('letra-frame');
    const letraImage = document.getElementById('letra-image');
    const popupContent = document.querySelector('.popup-content');
    
    popupOverlay.style.opacity = '0';
    setTimeout(() => {
        popupOverlay.style.display = 'none';
        letraFrame.src = '';
        letraImage.src = '';
        letraContainer.classList.remove('image-container');
        
        // Reset estilos do popup
        popupContent.style.maxWidth = '';
        popupContent.style.maxHeight = '';
        popupContent.style.width = '';
        popupContent.style.height = '';
        popupContent.style.position = '';
        popupContent.style.top = '';
        popupContent.style.left = '';
        popupContent.style.transform = '';
        
        // Reset estilos da imagem
        if (letraImage) {
            letraImage.style.width = '';
            letraImage.style.height = '';
            letraImage.style.maxWidth = '';
            letraImage.style.maxHeight = '';
        }
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
            console.error('Erro ao carregar lista salva:', error);
        }
    }
}

function mostrarToast(mensagem, tipo = 'success') {
    toast.textContent = mensagem;
    toast.className = `toast ${tipo}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Adicionar suporte a eventos de redimensionamento para ajustar popup
window.addEventListener('resize', function() {
    if (popupOverlay.style.display === 'block') {
        const letraImage = document.getElementById('letra-image');
        if (letraImage.style.display !== 'none') {
            ajustarPopupParaDispositivo(letraImage);
        } else {
            ajustarPopupParaDispositivo();
        }
    }
});

// Adicionar suporte a orientação para dispositivos móveis
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        if (popupOverlay.style.display === 'block') {
            const letraImage = document.getElementById('letra-image');
            if (letraImage.style.display !== 'none') {
                ajustarPopupParaDispositivo(letraImage);
            } else {
                ajustarPopupParaDispositivo();
            }
        }
    }, 500); // Aguardar mudança de orientação
});

