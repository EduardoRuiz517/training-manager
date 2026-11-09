
const API_DASHBOARD = 'http://localhost:3000/dashboard';

const mensagemDashboard = document.getElementById(
    'mensagemDashboard'
);

const botaoAtualizar = document.getElementById(
    'atualizarDashboard'
);

// ============================================
// CONSULTAR API
// ============================================

async function consultarDashboard(caminho) {
    const resposta = await fetch(
        `${API_DASHBOARD}/${caminho}`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem || 'Erro ao consultar dashboard.'
        );
    }

    return dados;
}

// ============================================
// FORMATAR NÚMEROS
// ============================================

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

function formatarPercentual(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    }) + '%';
}

// ============================================
// ATUALIZAR GRÁFICO
// ============================================

function atualizarBarra(id, quantidade, total) {
    const elemento = document.getElementById(id);

    const percentual = total > 0
        ? (quantidade / total) * 100
        : 0;

    elemento.style.width = `${percentual}%`;
}

// ============================================
// CARREGAR INDICADORES GERAIS
// ============================================

async function carregarResumo() {
    const dados = await consultarDashboard('resumo');

    document.getElementById('totalMatriculas').textContent =
        formatarNumero(dados.total_matriculas);

    document.getElementById('totalConcluidos').textContent =
        formatarNumero(dados.concluidos);

    document.getElementById('totalAusentes').textContent =
        formatarNumero(dados.ausentes);

    document.getElementById('taxaConclusao').textContent =
        formatarPercentual(dados.taxa_conclusao);

    document.getElementById('valorConcluidos').textContent =
        formatarNumero(dados.concluidos);

    document.getElementById('valorMatriculados').textContent =
        formatarNumero(dados.matriculados);

    document.getElementById('valorAusentes').textContent =
        formatarNumero(dados.ausentes);

    const total = Number(dados.total_matriculas);

    atualizarBarra(
        'barraConcluidos',
        Number(dados.concluidos),
        total
    );

    atualizarBarra(
        'barraMatriculados',
        Number(dados.matriculados),
        total
    );

    atualizarBarra(
        'barraAusentes',
        Number(dados.ausentes),
        total
    );
}

// ============================================
// CARREGAR INDICADORES POR TREINAMENTO
// ============================================

async function carregarIndicadoresTreinamentos() {
    const treinamentos = await consultarDashboard(
        'treinamentos'
    );

    const lista = document.getElementById(
        'listaIndicadoresTreinamentos'
    );

    lista.innerHTML = '';

    if (treinamentos.length === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 6;
        celula.textContent =
            'Nenhum treinamento encontrado.';

        linha.appendChild(celula);
        lista.appendChild(linha);
        return;
    }

    treinamentos.forEach(treinamento => {
        const linha = document.createElement('tr');

        const valores = [
            treinamento.treinamento,
            formatarNumero(treinamento.total_matriculas),
            formatarNumero(treinamento.concluidos),
            formatarNumero(treinamento.ausentes),
            formatarNumero(treinamento.matriculados),
            formatarPercentual(treinamento.taxa_conclusao)
        ];

        valores.forEach(valor => {
            const celula = document.createElement('td');

            celula.textContent = valor;
            linha.appendChild(celula);
        });

        lista.appendChild(linha);
    });
}

// ============================================
// CARREGAR DASHBOARD COMPLETO
// ============================================

async function carregarDashboard() {
    botaoAtualizar.disabled = true;

    mensagemDashboard.textContent =
        'Atualizando indicadores...';

    try {
        await Promise.all([
            carregarResumo(),
            carregarIndicadoresTreinamentos()
        ]);

        mensagemDashboard.textContent =
            'Indicadores atualizados com sucesso!';

    } catch (erro) {
        console.error(
            'Erro ao carregar dashboard:',
            erro
        );

        mensagemDashboard.textContent =
            `Erro: ${erro.message}`;

    } finally {
        botaoAtualizar.disabled = false;
    }
}

// ============================================
// EVENTOS E INICIALIZAÇÃO
// ============================================

botaoAtualizar.addEventListener(
    'click',
    carregarDashboard
);

carregarDashboard();
