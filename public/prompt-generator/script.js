const formElements = {
    productTitle: document.getElementById('productTitle'),
    productDesc: document.getElementById('productDesc'),
    price: document.getElementById('price'),
    oldPrice: document.getElementById('oldPrice'),
    styleSelect: document.getElementById('styleSelect'),
    formatSelect: document.getElementById('formatSelect'),
    mainColor: document.getElementById('mainColor'),
    ctaButton: document.getElementById('ctaButton'),
    templateSelect: document.getElementById('templateSelect'),
    syncedProductSelect: document.getElementById('syncedProductSelect')
};

const promptOutput = document.getElementById('promptOutput');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const exportBtn = document.getElementById('exportBtn');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const charCount = document.getElementById('charCount');

// Inteligência Artificial: Heurística (Gatilhos e Palavras-chave)
const aiHeuristics = {
    'bluetooth': ['Sem fio', 'Conexão Bluetooth', 'Wireless'],
    'bateria': ['Bateria de longa duração', 'Carregamento otimizado'],
    'água': ['À prova d\'água', 'Waterproof', 'Resistente a respingos'],
    'rgb': ['Iluminação RGB', 'Cores dinâmicas', 'Setup Gamer'],
    'premium': ['Design Premium', 'Material de alta qualidade', 'Acabamento luxuoso'],
    'rápido': ['Desempenho rápido', 'Alta velocidade'],
    'portátil': ['Fácil de transportar', 'Design compacto', 'Portátil'],
    'som': ['Som Potente', 'Graves profundos', 'Áudio de alta fidelidade'],
    'couro': ['Couro legítimo', 'Acabamento em couro', 'Sofisticação'],
    'magsafe': ['Compatível com MagSafe', 'Fixação magnética forte'],
    'fitness': ['Ideal para exercícios', 'Monitoramento fitness'],
    'inteligente': ['Smart AI', 'Tecnologia Inteligente', 'Casa Conectada'],
    '4k': ['Resolução 4K', 'Ultra HD', 'Imagem Cristalina']
};

// Modelos Prontos
const templates = {
    apple: {
        styleSelect: 'Apple Premium',
        formatSelect: 'Facebook Feed 1080x1350',
        mainColor: 'Branco',
        ctaButton: 'COMPRAR AGORA',
        checkboxes: ['Alta Qualidade', 'Produto Original']
    },
    mercadolivre: {
        styleSelect: 'Photorealistic',
        formatSelect: 'Square 1080x1080',
        mainColor: 'Amarelo',
        ctaButton: 'COMPRAR AGORA',
        checkboxes: ['Frete Grátis', 'Garantia']
    },
    shopee: {
        styleSelect: '3D Render',
        formatSelect: 'Square 1080x1080',
        mainColor: 'Laranja',
        ctaButton: 'COMPRAR',
        checkboxes: ['Frete Grátis']
    },
    nike: {
        styleSelect: 'Minimalist',
        formatSelect: 'Instagram Story 1080x1920',
        mainColor: 'Preto',
        ctaButton: 'EXPLORE AGORA',
        checkboxes: ['Alta Qualidade', 'Produto Original']
    },
    blackfriday: {
        styleSelect: 'Cyberpunk',
        formatSelect: 'Facebook Feed 1080x1350',
        mainColor: 'Preto',
        ctaButton: 'APROVEITAR OFERTA',
        checkboxes: ['Frete Grátis', 'Garantia']
    },
    minimalist: {
        styleSelect: 'Minimalist',
        formatSelect: 'Square 1080x1080',
        mainColor: 'Branco',
        ctaButton: 'SABER MAIS',
        checkboxes: ['Alta Qualidade']
    }
};

// Funções utilitárias
function getRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) return radios[i].value;
    }
    return '';
}

function getCheckedCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function setCheckedCheckboxes(values) {
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = values.includes(cb.value);
    });
}

function extractIntelligentFeatures(description) {
    if (!description) return [];
    const descLower = description.toLowerCase();
    const extractedFeatures = new Set();
    
    for (const [keyword, features] of Object.entries(aiHeuristics)) {
        if (descLower.includes(keyword)) {
            features.forEach(f => extractedFeatures.add(f));
        }
    }
    return Array.from(extractedFeatures);
}

// Geração do Prompt
function generatePrompt() {
    const title = formElements.productTitle.value.trim();
    const desc = formElements.productDesc.value.trim();
    const price = formElements.price.value.trim();
    const oldPrice = formElements.oldPrice.value.trim();
    const audience = getRadioValue('audience');
    const style = formElements.styleSelect.value;
    const format = formElements.formatSelect.value;
    const color = formElements.mainColor.value;
    const cta = formElements.ctaButton.value.trim();
    const manualBenefits = getCheckedCheckboxes();

    if (!title) {
        alert("Por favor, insira pelo menos o Título do Produto para gerar o prompt.");
        return;
    }

    // Inteligência Artificial - Extração
    const aiBenefits = extractIntelligentFeatures(desc);
    
    // Mesclar benefícios manuais e gerados pela IA (removendo duplicados)
    const allBenefits = [...new Set([...manualBenefits, ...aiBenefits])];

    let promptLines = [];

    promptLines.push(`Crie um banner publicitário (${format}).`);
    promptLines.push(`Produto: "${title}".`);
    
    promptLines.push(`\n**Layout Estrutural:**`);
    promptLines.push(`- DIREITA: Imagem do produto em grande destaque (50% da tela).`);
    promptLines.push(`- ESQUERDA (Topo): Tag de alerta (ex: "🔥 OFERTA LIMITADA!").`);
    promptLines.push(`- ESQUERDA (Título): Título principal GIGANTE e garrafal.`);
    promptLines.push(`- ESQUERDA (Meio): Lista curta de benefícios (ícone + texto curto).`);
    promptLines.push(`- ESQUERDA (Inferior): Bloco GIGANTE de cor vibrante com preço antigo riscado e preço novo massivo.`);
    promptLines.push(`- ESQUERDA (Base): Botão de Ação (CTA) moderno.`);
    promptLines.push(`- RODAPÉ: 3 minúsculos selos de confiança.`);
    
    promptLines.push(`\n**Estilo Visual:**`);
    promptLines.push(`Fundo predominante: ${color}. Estética: ${style}.`);
    promptLines.push(`Iluminação de estúdio, sombras suaves, premium high-end.`);
    
    if (audience !== 'Ambos') {
        promptLines.push(`Atmosfera focada no público ${audience}.`);
    }

    promptLines.push(`\n**Textos Exatos na Imagem:**`);
    promptLines.push(`Título Principal: ${title.toUpperCase()}`);
    
    if (oldPrice && price) {
        promptLines.push(`Bloco de Preço: DE ${oldPrice} POR APENAS ${price}`);
    } else if (price) {
        promptLines.push(`Bloco de Preço: POR APENAS ${price}`);
    }

    if (allBenefits.length > 0) {
        // Limitar para não bugar a IA com excesso de texto
        const limitedBenefits = allBenefits.slice(0, 6);
        promptLines.push(`\nBenefícios (Máx 6 itens para manter limpo, criar ícone para cada):`);
        limitedBenefits.forEach(benefit => {
            promptLines.push(`- ${benefit}`);
        });
    }

    if (cta) {
        promptLines.push(`\nBotão CTA: ${cta}`);
    }

    promptLines.push(`\n**Gatilhos Visuais de Alta Conversão (Neuromarketing):**`);
    promptLines.push(`- Contraste Extremo: O botão CTA e o bloco de Preço devem usar cores complementares ao fundo para saltar aos olhos.`);
    promptLines.push(`- Direcionamento Visual: Use iluminação e composição que guiem os olhos do consumidor direto para o produto e para o preço.`);
    promptLines.push(`- Regra dos 3 Segundos: O título e o preço devem ser legíveis instantaneamente, fontes grossas e sem serifa.`);
    promptLines.push(`- Percepção de Valor: O produto deve parecer extremamente premium, bem iluminado e irresistível.`);
    
    promptLines.push(`\n**Instruções de Renderização e Qualidade:**`);
    promptLines.push(`Render hiper realista, 8K, Advertising Photography, High Conversion Ad Design.`);
    promptLines.push(`Mantenha o design com "respiro" (espaço em branco), evite poluição visual e garanta legibilidade máxima dos textos.`);

    const finalPrompt = promptLines.join('\n');
    
    promptOutput.value = finalPrompt;
    updateCharCount();
    
    // Feedback visual
    generateBtn.textContent = '✅ PROMPT GERADO!';
    generateBtn.style.backgroundColor = '#10b981'; // Verde sucesso
    
    setTimeout(() => {
        generateBtn.textContent = '🚀 GERAR PROMPT';
        generateBtn.style.backgroundColor = 'var(--accent-color)';
    }, 2000);
}

function updateCharCount() {
    const length = promptOutput.value.length;
    charCount.textContent = `${length} caracteres`;
}

// Event Listeners
generateBtn.addEventListener('click', generatePrompt);

promptOutput.addEventListener('input', updateCharCount);

copyBtn.addEventListener('click', () => {
    if (!promptOutput.value) return;
    navigator.clipboard.writeText(promptOutput.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado!';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });
});

exportBtn.addEventListener('click', () => {
    if (!promptOutput.value) return;
    const blob = new Blob([promptOutput.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prompt_${formElements.productTitle.value.trim().replace(/\s+/g, '_') || 'Gerado'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

formElements.templateSelect.addEventListener('change', (e) => {
    const templateName = e.target.value;
    if (templateName && templates[templateName]) {
        const tpl = templates[templateName];
        formElements.styleSelect.value = tpl.styleSelect;
        formElements.formatSelect.value = tpl.formatSelect;
        formElements.mainColor.value = tpl.mainColor;
        formElements.ctaButton.value = tpl.ctaButton;
        setCheckedCheckboxes(tpl.checkboxes);
    } else if (templateName === '') {
        // Reset defaults if empty
        formElements.styleSelect.selectedIndex = 0;
        formElements.formatSelect.selectedIndex = 0;
        formElements.mainColor.selectedIndex = 0;
        formElements.ctaButton.value = 'COMPRAR AGORA';
        setCheckedCheckboxes([]);
    }
});

saveTemplateBtn.addEventListener('click', () => {
    const templateName = prompt('Dê um nome para o seu modelo personalizado:');
    if (templateName && templateName.trim() !== '') {
        const safeName = templateName.trim().toLowerCase().replace(/\s+/g, '_');
        const customTemplate = {
            styleSelect: formElements.styleSelect.value,
            formatSelect: formElements.formatSelect.value,
            mainColor: formElements.mainColor.value,
            ctaButton: formElements.ctaButton.value,
            checkboxes: getCheckedCheckboxes()
        };
        
        // Salvar no localStorage
        let savedTemplates = JSON.parse(localStorage.getItem('promptCreatorTemplates')) || {};
        savedTemplates[safeName] = customTemplate;
        localStorage.setItem('promptCreatorTemplates', JSON.stringify(savedTemplates));
        
        // Adicionar ao objeto em memória e select
        templates[safeName] = customTemplate;
        
        const option = document.createElement('option');
        option.value = safeName;
        option.textContent = templateName + " (Custom)";
        formElements.templateSelect.appendChild(option);
        formElements.templateSelect.value = safeName;
        
        alert('Modelo salvo com sucesso!');
    }
});

let syncedProductsData = [];

// Inicialização
async function init() {
    // Carregar templates salvos do localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('promptCreatorTemplates')) || {};
    for (const [key, value] of Object.entries(savedTemplates)) {
        templates[key] = value;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.replace(/_/g, ' ') + " (Custom)";
        formElements.templateSelect.appendChild(option);
    }

    // Carregar produtos sincronizados
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                syncedProductsData = data.products;
                formElements.syncedProductSelect.innerHTML = '<option value="">-- Selecione o produto --</option>';
                data.products.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.custom_title || p.original_title;
                    formElements.syncedProductSelect.appendChild(opt);
                });
            } else {
                formElements.syncedProductSelect.innerHTML = '<option value="">Nenhum produto encontrado</option>';
                formElements.syncedProductSelect.disabled = true;
            }
        }
    } catch (err) {
        formElements.syncedProductSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        formElements.syncedProductSelect.disabled = true;
    }
}

// Quando selecionar um produto, preencher os campos
formElements.syncedProductSelect.addEventListener('change', async (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
        formElements.productTitle.value = '';
        formElements.productDesc.value = '';
        updateCharCount();
        return;
    }

    const prod = syncedProductsData.find(p => p.id === selectedId);
    if (prod) {
        formElements.productTitle.value = prod.custom_title || prod.original_title;
        
        const currentPrice = prod.custom_price || prod.original_price;
        if (currentPrice) {
            formElements.price.value = `R$ ${parseFloat(currentPrice).toFixed(2).replace('.', ',')}`;
        } else {
            formElements.price.value = '';
        }

        // Mostrar aviso de carregamento
        formElements.productDesc.value = "Carregando descrição do Mercado Livre...";
        updateCharCount();

        try {
            const res = await fetch(`/api/products/description?id=${selectedId}`);
            if (res.ok) {
                const data = await res.json();
                formElements.productDesc.value = data.description || '';
            } else {
                formElements.productDesc.value = "Não foi possível carregar a descrição.";
            }
        } catch (err) {
            formElements.productDesc.value = "Erro ao carregar descrição.";
        }
        
        updateCharCount();
    }
});

init();
