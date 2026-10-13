
const API_TURMAS = 'http://localhost:3000/turmas';
const API_TREINAMENTOS = 'http://localhost:3000/treinamentos';
const API_COLABORADORES = 'http://localhost:3000/colaboradores';
const API_MATRICULAS = 'http://localhost:3000/matriculas';

const formTurma = document.getElementById('formTurma');
const mensagem = document.getElementById('mensagem');
const listaTurmas = document.getElementById('listaTurmas');
const selectTreinamento = document.getElementById('treinamento_id');

const formImportacao = document.getElementById('formImportacao');
const arquivoCSV = document.getElementById('arquivoCSV');
const mensagemImportacao = document.getElementById('mensagemImportacao');
const resultadoImportacao = document.getElementById('resultadoImportacao');
const totalImportacao = document.getElementById('totalImportacao');
const totalImportados = document.getElementById('totalImportados');
const totalIgnorados = document.getElementById('totalIgnorados');
const areaErrosImportacao = document.getElementById('areaErrosImportacao');
const listaErrosImportacao = document.getElementById('listaErrosImportacao');

const areaParticipantes = document.getElementById('areaParticipantes');
const tituloParticipantes = document.getElementById('tituloParticipantes');
const formMatricula = document.getElementById('formMatricula');
const selectColaborador = document.getElementById('colaborador_id');
const mensagemMatricula = document.getElementById('mensagemMatricula');
const listaParticipantes = document.getElementById('listaParticipantes');

let turmaSelecionadaId = null;

// CONSULTAR API
async function consultarAPI(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.mensagem || 'Erro na comunicação com o servidor.'
        );
    }

    return dados;
}

// CARREGAR TREINAMENTOS
async function carregarTreinamentos() {
    try {
        const treinamentos = await consultarAPI(API_TREINAMENTOS);

        selectTreinamento.innerHTML =
            '<option value="">Selecione o treinamento</option>';

        treinamentos.forEach(treinamento => {
            const option = document.createElement('option');
            option.value = treinamento.id;
            option.textContent = treinamento.nome;
            selectTreinamento.appendChild(option);
        });

    } catch (erro) {
        console.error('Erro ao carregar treinamentos:', erro);
    }
}

// CARREGAR COLABORADORES
async function carregarColaboradores() {
    try {
        const colaboradores = await consultarAPI(API_COLABORADORES);

        selectColaborador.innerHTML =
            '<option value="">Selecione o colaborador</option>';

        colaboradores.forEach(colaborador => {
            const option = document.createElement('option');
            option.value = colaborador.id;
            option.textContent =
                `${colaborador.nome} - ${colaborador.matricula}`;

            selectColaborador.appendChild(option);
        });

    } catch (erro) {
        console.error('Erro ao carregar colaboradores:', erro);
    }
}

// FORMATAR DATA
function formatarData(data) {
    if (!data) return '';

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });
}

// CARREGAR TURMAS
async function carregarTurmas() {
    try {
        const turmas = await consultarAPI(API_TURMAS);

        listaTurmas.innerHTML = '';

        turmas.forEach(turma => {
            const linha = document.createElement('tr');

            const valores = [
                turma.id,
                turma.nome,
                turma.treinamento,
                formatarData(turma.data_inicio),
                turma.horario || '',
                turma.local || '',
                turma.vagas ?? '',
                turma.status
            ];

            valores.forEach(valor => {
                const celula = document.createElement('td');
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            const celulaAcao = document.createElement('td');
            const botao = document.createElement('button');

            botao.type = 'button';
            botao.textContent = 'Gerenciar';

            botao.addEventListener('click', () => {
                gerenciarTurma(turma.id, turma.nome);
            });

            celulaAcao.appendChild(botao);
            linha.appendChild(celulaAcao);
            listaTurmas.appendChild(linha);
        });

    } catch (erro) {
        console.error('Erro ao carregar turmas:', erro);
    }
}

// CADASTRAR TURMA
formTurma.addEventListener('submit', async (event) => {
    event.preventDefault();

    const turma = {
        treinamento_id: selectTreinamento.value,
        nome: document.getElementById('nome').value,
        data_inicio: document.getElementById('data_inicio').value,
        data_fim: document.getElementById('data_fim').value,
        horario: document.getElementById('horario').value,
        local: document.getElementById('local').value,
        vagas: document.getElementById('vagas').value
    };

    try {
        const dados = await consultarAPI(API_TURMAS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(turma)
        });

        mensagem.textContent = dados.mensagem;
        formTurma.reset();
        await carregarTurmas();

    } catch (erro) {
        mensagem.textContent = erro.message;
        console.error(erro);
    }
});

// IMPORTAÇÃO EM LOTE
formImportacao.addEventListener('submit', async (event) => {
    event.preventDefault();

    const arquivo = arquivoCSV.files[0];

    if (!arquivo) {
        mensagemImportacao.textContent = 'Selecione um arquivo CSV.';
        return;
    }

    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const botao = formImportacao.querySelector(
        'button[type="submit"]'
    );

    mensagemImportacao.textContent = 'Importando turmas...';
    resultadoImportacao.style.display = 'none';
    areaErrosImportacao.style.display = 'none';
    listaErrosImportacao.innerHTML = '';

    botao.disabled = true;

    try {
        const dados = await consultarAPI(
            `${API_TURMAS}/importar`,
            {
                method: 'POST',
                body: formData
            }
        );

        mensagemImportacao.textContent = dados.mensagem;

        totalImportacao.textContent = dados.total;
        totalImportados.textContent = dados.importados;
        totalIgnorados.textContent = dados.ignorados;

        resultadoImportacao.style.display = 'block';

        const detalhes = dados.detalhes || [];

        if (detalhes.length > 0) {
            areaErrosImportacao.style.display = 'block';

            detalhes.forEach(detalhe => {
                const linha = document.createElement('tr');

                [
                    detalhe.linha ?? '',
                    detalhe.treinamento || '',
                    detalhe.motivo || ''
                ].forEach(valor => {
                    const celula = document.createElement('td');
                    celula.textContent = valor;
                    linha.appendChild(celula);
                });

                listaErrosImportacao.appendChild(linha);
            });
        }

        formImportacao.reset();
        await carregarTurmas();

    } catch (erro) {
        mensagemImportacao.textContent = erro.message;
        console.error('Erro na importação:', erro);

    } finally {
        botao.disabled = false;
    }
});

// GERENCIAR TURMA
async function gerenciarTurma(id, nome) {
    turmaSelecionadaId = id;

    areaParticipantes.style.display = 'block';

    tituloParticipantes.textContent =
        `Participantes da Turma - ${nome}`;

    mensagemMatricula.textContent = '';

    await carregarParticipantes();

    areaParticipantes.scrollIntoView({
        behavior: 'smooth'
    });
}

// CARREGAR PARTICIPANTES
async function carregarParticipantes() {
    try {
        const matriculas = await consultarAPI(API_MATRICULAS);

        const participantesTurma = matriculas.filter(
            matricula =>
                String(matricula.turma_id) ===
                String(turmaSelecionadaId)
        );

        listaParticipantes.innerHTML = '';

        participantesTurma.forEach(matricula => {
            const linha = document.createElement('tr');

            [
                matricula.colaborador,
                matricula.matricula,
                matricula.status
            ].forEach(valor => {
                const celula = document.createElement('td');
                celula.textContent = valor ?? '';
                linha.appendChild(celula);
            });

            listaParticipantes.appendChild(linha);
        });

        if (participantesTurma.length === 0) {
            const linha = document.createElement('tr');
            const celula = document.createElement('td');

            celula.colSpan = 3;
            celula.textContent =
                'Nenhum participante matriculado nesta turma.';

            linha.appendChild(celula);
            listaParticipantes.appendChild(linha);
        }

    } catch (erro) {
        console.error('Erro ao carregar participantes:', erro);
    }
}

// MATRICULAR COLABORADOR
formMatricula.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!turmaSelecionadaId) {
        mensagemMatricula.textContent =
            'Selecione uma turma primeiro.';
        return;
    }

    const matricula = {
        turma_id: turmaSelecionadaId,
        colaborador_id: selectColaborador.value
    };

    try {
        const dados = await consultarAPI(API_MATRICULAS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matricula)
        });

        mensagemMatricula.textContent = dados.mensagem;
        formMatricula.reset();

        await carregarParticipantes();

    } catch (erro) {
        mensagemMatricula.textContent = erro.message;
        console.error(erro);
    }
});

// INICIALIZAR
carregarTreinamentos();
carregarColaboradores();
carregarTurmas();
