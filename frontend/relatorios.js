
const API = 'http://localhost:3000';

// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const filtroTreinamento = document.getElementById('filtroTreinamento');
const filtroTurma = document.getElementById('filtroTurma');
const filtroStatus = document.getElementById('filtroStatus');
const filtroDataInicio = document.getElementById('filtroDataInicio');
const filtroDataFim = document.getElementById('filtroDataFim');

const corpoRelatorio = document.getElementById('corpoRelatorio');
const mensagem = document.getElementById('mensagemRelatorio');
const totalRegistros = document.getElementById('totalRegistros');

const btnConsultar = document.getElementById('btnConsultar');
const btnExportar = document.getElementById('btnExportar');
const btnLimpar = document.getElementById('btnLimpar');

let dadosRelatorio = [];
let todasTurmas = [];
let consultaAtualizada = false;

// ============================================
// CONSULTAR API
// ============================================

async function buscarJSON(caminho) {
    const resposta = await fetch(`${API}${caminho}`);

    if (!resposta.ok) {
        throw new Error(
            `Erro HTTP ${resposta.status} ao consultar ${caminho}`
        );
    }

    const dados = await resposta.json();

    return dados;
}

// ============================================
// FORMATAR DATAS
// ============================================

function formatarData(valor) {
    if (!valor) return '';

    const data = String(valor).slice(0, 10);
    const partes = data.split('-');

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================
// FORMATAR NÚMEROS
// ============================================

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

// ============================================
// CARREGAR TREINAMENTOS E TURMAS
// ============================================

async function carregarFiltros() {
    try {
        mensagem.textContent = 'Carregando filtros...';

        const [treinamentos, turmas] = await Promise.all([
            buscarJSON('/treinamentos'),
            buscarJSON('/turmas')
        ]);

        if (!Array.isArray(treinamentos)) {
            throw new Error(
                'A API de treinamentos não retornou uma lista.'
            );
        }

        if (!Array.isArray(turmas)) {
            throw new Error(
                'A API de turmas não retornou uma lista.'
            );
        }

        todasTurmas = turmas;

        // Limpar opções anteriores
        filtroTreinamento.innerHTML = '';
        filtroTurma.innerHTML = '';

        const opcaoTodos = document.createElement('option');
        opcaoTodos.value = '';
        opcaoTodos.textContent = 'Todos';

        filtroTreinamento.appendChild(opcaoTodos);

        // Ordenar treinamentos pelo nome
        treinamentos.sort((a, b) =>
            String(a.nome || '').localeCompare(
                String(b.nome || ''),
                'pt-BR'
            )
        );

        // Preencher treinamento
        treinamentos.forEach(treinamento => {
            const opcao = document.createElement('option');

            opcao.value = String(treinamento.id);
            opcao.textContent = treinamento.nome;

            filtroTreinamento.appendChild(opcao);
        });

        // Preencher todas as turmas inicialmente
        atualizarFiltroTurmas();

        mensagem.textContent =
            'Filtros carregados com sucesso.';

    } catch (erro) {
        console.error('Erro ao carregar filtros:', erro);

        mensagem.textContent =
            `Erro ao carregar filtros: ${erro.message}`;
    }
}

// ============================================
// FILTRAR TURMAS POR TREINAMENTO
// ============================================

function atualizarFiltroTurmas() {
    const treinamentoSelecionado = filtroTreinamento.value;
    const turmaAnterior = filtroTurma.value;

    filtroTurma.innerHTML = '';

    const opcaoTodas = document.createElement('option');
    opcaoTodas.value = '';
    opcaoTodas.textContent = 'Todas';

    filtroTurma.appendChild(opcaoTodas);

    const turmasFiltradas = todasTurmas.filter(turma => {
        if (!treinamentoSelecionado) {
            return true;
        }

        return String(turma.treinamento_id) ===
            String(treinamentoSelecionado);
    });

    turmasFiltradas.sort((a, b) =>
        String(a.nome || '').localeCompare(
            String(b.nome || ''),
            'pt-BR'
        )
    );

    turmasFiltradas.forEach(turma => {
        const opcao = document.createElement('option');

        opcao.value = String(turma.id);
        opcao.textContent = turma.nome;

        filtroTurma.appendChild(opcao);
    });

    // Manter seleção anterior se ainda for válida
    const turmaAindaExiste = turmasFiltradas.some(
        turma => String(turma.id) === turmaAnterior
    );

    if (turmaAindaExiste) {
        filtroTurma.value = turmaAnterior;
    } else {
        filtroTurma.value = '';
    }
}

// ============================================
// CRIAR PARÂMETROS DA CONSULTA
// ============================================

function criarParametros() {
    const parametros = new URLSearchParams();

    // Treinamento
    if (filtroTreinamento.value) {
        parametros.set(
            'treinamento_id',
            filtroTreinamento.value
        );
    }

    // Turma
    if (filtroTurma.value) {
        parametros.set(
            'turma_id',
            filtroTurma.value
        );
    }

    // Status
    if (filtroStatus.value) {
        parametros.set(
            'status',
            filtroStatus.value
        );
    }

    // Data inicial
    if (filtroDataInicio.value) {
        parametros.set(
            'data_inicio',
            filtroDataInicio.value
        );
    }

    // Data final
    if (filtroDataFim.value) {
        parametros.set(
            'data_fim',
            filtroDataFim.value
        );
    }

    return parametros;
}

// ============================================
// EXIBIR DADOS NA TABELA
// ============================================

function mostrarTabela(registros) {
    corpoRelatorio.innerHTML = '';

    totalRegistros.textContent =
        formatarNumero(registros.length);

    if (registros.length === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 10;
        celula.textContent =
            'Nenhum registro encontrado para os filtros selecionados.';

        linha.appendChild(celula);
        corpoRelatorio.appendChild(linha);

        return;
    }

    registros.forEach(item => {
        const linha = document.createElement('tr');

        const valores = [
            item.matricula,
            item.colaborador,
            item.cargo,
            item.loja,
            item.treinamento,
            item.turma,
            item.carga_horaria,
            formatarData(item.data_inicio),
            item.status,
            formatarData(item.data_conclusao)
        ];

        valores.forEach(valor => {
            const celula = document.createElement('td');

            celula.textContent = valor ?? '';

            linha.appendChild(celula);
        });

        corpoRelatorio.appendChild(linha);
    });
}

// ============================================
// CONSULTAR RELATÓRIO
// ============================================

async function consultarRelatorio() {
    mensagem.textContent = 'Consultando registros...';

    btnConsultar.disabled = true;
    btnExportar.disabled = true;
    consultaAtualizada = false;

    try {
        const parametros = criarParametros();

        const caminho =
            `/relatorios/matriculas?${parametros.toString()}`;

        const registros = await buscarJSON(caminho);

        if (!Array.isArray(registros)) {
            throw new Error(
                'A API não retornou uma lista de matrículas.'
            );
        }

        // Todos os filtros são aplicados pelo backend
        dadosRelatorio = registros;

        mostrarTabela(dadosRelatorio);

        consultaAtualizada = true;
        btnExportar.disabled = dadosRelatorio.length === 0;

        mensagem.textContent =
            `Consulta realizada: ${formatarNumero(
                dadosRelatorio.length
            )} registros encontrados.`;

    } catch (erro) {
        console.error('Erro ao consultar relatório:', erro);

        dadosRelatorio = [];
        mostrarTabela([]);

        mensagem.textContent =
            `Erro ao consultar relatório: ${erro.message}`;

    } finally {
        btnConsultar.disabled = false;
    }
}

// ============================================
// PROTEGER VALORES DO CSV
// ============================================

function valorCSV(valor) {
    let texto = String(valor ?? '');

    // Evita interpretação de fórmulas pelo Excel
    if (/^\s*[=+\-@\t\r\n]/.test(texto)) {
        texto = "'" + texto;
    }

    return `"${texto.replace(/"/g, '""')}"`;
}

// ============================================
// EXPORTAR RELATÓRIO CSV
// ============================================

function exportarCSV() {
    if (!consultaAtualizada || dadosRelatorio.length === 0) {
        mensagem.textContent =
            'Consulte os registros antes de exportar.';
        return;
    }

    const colunas = [
        ['Matrícula', 'matricula'],
        ['Colaborador', 'colaborador'],
        ['Cargo', 'cargo'],
        ['Loja', 'loja'],
        ['Treinamento', 'treinamento'],
        ['Turma', 'turma'],
        ['Carga horária', 'carga_horaria'],
        ['Início da turma', 'data_inicio'],
        ['Fim da turma', 'data_fim'],
        ['Status', 'status'],
        ['Data de conclusão', 'data_conclusao']
    ];

    const linhas = [];

    // Cabeçalho
    linhas.push(
        colunas.map(coluna => valorCSV(coluna[0])).join(';')
    );

    // Registros
    dadosRelatorio.forEach(item => {
        const linha = colunas.map(([titulo, campo]) => {
            let valor = item[campo];

            if (campo.startsWith('data_')) {
                valor = formatarData(valor);
            }

            return valorCSV(valor);
        });

        linhas.push(linha.join(';'));
    });

    // UTF-8 com BOM para o Excel
    const conteudo = '\uFEFF' + linhas.join('\r\n');

    const arquivo = new Blob([conteudo], {
        type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(arquivo);

    const link = document.createElement('a');

    link.href = url;

    const dataHoje = new Date()
        .toLocaleDateString('sv-SE');

    link.download =
        `relatorio_matriculas_${dataHoje}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Liberar o endereço temporário após iniciar o download
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    mensagem.textContent =
        `${formatarNumero(dadosRelatorio.length)} registros exportados.`;
}

// ============================================
// LIMPAR FILTROS
// ============================================

function limparFiltros() {
    filtroTreinamento.value = '';
    filtroTurma.value = '';
    filtroStatus.value = '';
    filtroDataInicio.value = '';
    filtroDataFim.value = '';

    atualizarFiltroTurmas();
    consultarRelatorio();
}

// ============================================
// MARCAR CONSULTA COMO DESATUALIZADA
// ============================================

function marcarFiltrosAlterados() {
    consultaAtualizada = false;
    btnExportar.disabled = true;

    mensagem.textContent =
        'Filtros alterados. Clique em Consultar para atualizar o relatório.';
}

// ============================================
// EVENTOS
// ============================================

btnConsultar.addEventListener(
    'click',
    consultarRelatorio
);

btnExportar.addEventListener(
    'click',
    exportarCSV
);

btnLimpar.addEventListener(
    'click',
    limparFiltros
);

filtroTreinamento.addEventListener('change', () => {
    atualizarFiltroTurmas();
    marcarFiltrosAlterados();
});

[
    filtroTurma,
    filtroStatus,
    filtroDataInicio,
    filtroDataFim
].forEach(campo => {
    campo.addEventListener(
        'change',
        marcarFiltrosAlterados
    );
});

// ============================================
// INICIALIZAÇÃO
// ============================================

async function iniciar() {
    btnExportar.disabled = true;

    await carregarFiltros();
    await consultarRelatorio();
}

iniciar();
