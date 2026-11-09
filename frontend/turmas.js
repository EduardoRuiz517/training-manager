
const API_TURMAS = 'http://localhost:3000/turmas';
const API_TREINAMENTOS = 'http://localhost:3000/treinamentos';
const API_COLABORADORES = 'http://localhost:3000/colaboradores';
const API_MATRICULAS = 'http://localhost:3000/matriculas';

// ============================================
// ELEMENTOS DO CADASTRO DE TURMAS
// ============================================

const formTurma = document.getElementById('formTurma');
const mensagem = document.getElementById('mensagem');
const listaTurmas = document.getElementById('listaTurmas');
const selectTreinamento = document.getElementById('treinamento_id');

// ============================================
// ELEMENTOS DA IMPORTAÇÃO DE TURMAS
// ============================================

const formImportacao = document.getElementById('formImportacao');
const arquivoCSV = document.getElementById('arquivoCSV');
const mensagemImportacao = document.getElementById('mensagemImportacao');
const resultadoImportacao = document.getElementById('resultadoImportacao');
const totalImportacao = document.getElementById('totalImportacao');
const totalImportados = document.getElementById('totalImportados');
const totalIgnorados = document.getElementById('totalIgnorados');
const areaErrosImportacao = document.getElementById('areaErrosImportacao');
const listaErrosImportacao = document.getElementById('listaErrosImportacao');

// ============================================
// ELEMENTOS DO GERENCIAMENTO DE PARTICIPANTES
// ============================================

const areaParticipantes = document.getElementById('areaParticipantes');
const tituloParticipantes = document.getElementById('tituloParticipantes');
const formMatricula = document.getElementById('formMatricula');
const selectColaborador = document.getElementById('colaborador_id');
const mensagemMatricula = document.getElementById('mensagemMatricula');
const listaParticipantes = document.getElementById('listaParticipantes');

// ============================================
// ELEMENTOS DA IMPORTAÇÃO DE MATRÍCULAS
// ============================================

const formImportacaoMatriculas = document.getElementById(
    'formImportacaoMatriculas'
);

const arquivoMatriculas = document.getElementById('arquivoMatriculas');

const mensagemImportacaoMatriculas = document.getElementById(
    'mensagemImportacaoMatriculas'
);

const resultadoImportacaoMatriculas = document.getElementById(
    'resultadoImportacaoMatriculas'
);

const totalMatriculas = document.getElementById('totalMatriculas');
const matriculasImportadas = document.getElementById('matriculasImportadas');
const matriculasIgnoradas = document.getElementById('matriculasIgnoradas');
const areaErrosMatriculas = document.getElementById('areaErrosMatriculas');
const listaErrosMatriculas = document.getElementById('listaErrosMatriculas');

// TURMA SELECIONADA PARA GERENCIAMENTO
let turmaSelecionadaId = null;

// ============================================
// CONSULTAR API
// ============================================

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

// ============================================
// CARREGAR TREINAMENTOS
// ============================================

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

// ============================================
// CARREGAR COLABORADORES
// ============================================

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

// ============================================
// FORMATAR DATA
// ============================================

function formatarData(data) {
    if (!data) {
        return '-';
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return '-';
    }

    return dataConvertida.toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });
}

// ============================================
// CARREGAR TURMAS
// ============================================

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

                celula.textContent = valor ?? '';
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

// ============================================
// CADASTRAR TURMA INDIVIDUAL
// ============================================

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
        console.error('Erro ao cadastrar turma:', erro);
    }
});

// ============================================
// IMPORTAÇÃO EM LOTE DE TURMAS
// ============================================

formImportacao.addEventListener('submit', async (event) => {
    event.preventDefault();

    const arquivo = arquivoCSV.files[0];

    if (!arquivo) {
        mensagemImportacao.textContent =
            'Selecione um arquivo CSV.';
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

        console.error(
            'Erro na importação de turmas:',
            erro
        );

    } finally {
        botao.disabled = false;
    }
});

// ============================================
// GERENCIAR TURMA
// ============================================

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

// ============================================
// AC3 - CARREGAR PARTICIPANTES
// COM CONTROLE DE STATUS E CONCLUSÃO
// ============================================

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

            // NOME DO COLABORADOR
            const celulaNome = document.createElement('td');
            celulaNome.textContent = matricula.colaborador ?? '';

            linha.appendChild(celulaNome);

            // MATRÍCULA DO COLABORADOR
            const celulaMatricula = document.createElement('td');
            celulaMatricula.textContent = matricula.matricula ?? '';

            linha.appendChild(celulaMatricula);

            // SELETOR DE STATUS
            const celulaStatus = document.createElement('td');
            const selectStatus = document.createElement('select');

            const statusPermitidos = [
                'Matriculado',
                'Concluído',
                'Ausente'
            ];

            statusPermitidos.forEach(status => {
                const option = document.createElement('option');

                option.value = status;
                option.textContent = status;

                selectStatus.appendChild(option);
            });

            // MOSTRAR O STATUS ATUAL DO BANCO
            selectStatus.value = statusPermitidos.includes(
                matricula.status
            )
                ? matricula.status
                : 'Matriculado';

            celulaStatus.appendChild(selectStatus);
            linha.appendChild(celulaStatus);

            // DATA DE CONCLUSÃO
            const celulaData = document.createElement('td');

            celulaData.textContent = matricula.data_conclusao
                ? formatarData(matricula.data_conclusao)
                : '-';

            linha.appendChild(celulaData);

            // BOTÃO SALVAR
            const celulaAcao = document.createElement('td');
            const botaoSalvar = document.createElement('button');

            botaoSalvar.type = 'button';
            botaoSalvar.textContent = 'Salvar';

            // AC3 - ATUALIZAR STATUS NO MYSQL
            botaoSalvar.addEventListener('click', async () => {
                const novoStatus = selectStatus.value;

                botaoSalvar.disabled = true;
                selectStatus.disabled = true;

                botaoSalvar.textContent = 'Salvando...';

                try {
                    const dados = await consultarAPI(
                        `${API_MATRICULAS}/${matricula.id}/status`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                status: novoStatus
                            })
                        }
                    );

                    mensagemMatricula.textContent =
                        dados.mensagem ||
                        'Status atualizado com sucesso!';

                    // ATUALIZAR LISTA APÓS SALVAR
                    await carregarParticipantes();

                } catch (erro) {
                    mensagemMatricula.textContent =
                        erro.message;

                    console.error(
                        'Erro ao atualizar status:',
                        erro
                    );

                    botaoSalvar.disabled = false;
                    selectStatus.disabled = false;
                    botaoSalvar.textContent = 'Salvar';
                }
            });

            celulaAcao.appendChild(botaoSalvar);
            linha.appendChild(celulaAcao);

            listaParticipantes.appendChild(linha);
        });

        // QUANDO NÃO EXISTIREM PARTICIPANTES
        if (participantesTurma.length === 0) {
            const linha = document.createElement('tr');
            const celula = document.createElement('td');

            celula.colSpan = 5;

            celula.textContent =
                'Nenhum participante matriculado nesta turma.';

            linha.appendChild(celula);
            listaParticipantes.appendChild(linha);
        }

    } catch (erro) {
        console.error(
            'Erro ao carregar participantes:',
            erro
        );

        mensagemMatricula.textContent =
            'Erro ao carregar participantes.';
    }
}

// ============================================
// MATRICULAR COLABORADOR INDIVIDUALMENTE
// ============================================

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

        console.error(
            'Erro ao matricular colaborador:',
            erro
        );
    }
});

// ============================================
// IMPORTAÇÃO EM LOTE DE MATRÍCULAS
// ============================================

formImportacaoMatriculas.addEventListener(
    'submit',
    async (event) => {
        event.preventDefault();

        const arquivo = arquivoMatriculas.files[0];

        if (!arquivo) {
            mensagemImportacaoMatriculas.textContent =
                'Selecione um arquivo CSV.';
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', arquivo);

        const botao = formImportacaoMatriculas.querySelector(
            'button[type="submit"]'
        );

        mensagemImportacaoMatriculas.textContent =
            'Importando matrículas...';

        resultadoImportacaoMatriculas.style.display = 'none';
        areaErrosMatriculas.style.display = 'none';
        listaErrosMatriculas.innerHTML = '';

        botao.disabled = true;

        try {
            const dados = await consultarAPI(
                `${API_MATRICULAS}/importar`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            mensagemImportacaoMatriculas.textContent =
                dados.mensagem;

            totalMatriculas.textContent = dados.total;
            matriculasImportadas.textContent = dados.importados;
            matriculasIgnoradas.textContent = dados.ignorados;

            resultadoImportacaoMatriculas.style.display = 'block';

            const detalhes = dados.detalhes || [];

            if (detalhes.length > 0) {
                areaErrosMatriculas.style.display = 'block';

                detalhes.forEach(detalhe => {
                    const linha = document.createElement('tr');

                    [
                        detalhe.linha ?? '',
                        detalhe.matricula || '',
                        detalhe.turma_id || '',
                        detalhe.motivo || ''
                    ].forEach(valor => {
                        const celula = document.createElement('td');

                        celula.textContent = valor;
                        linha.appendChild(celula);
                    });

                    listaErrosMatriculas.appendChild(linha);
                });
            }

            formImportacaoMatriculas.reset();

            // ATUALIZAR PARTICIPANTES DA TURMA ABERTA
            if (turmaSelecionadaId) {
                await carregarParticipantes();
            }

        } catch (erro) {
            mensagemImportacaoMatriculas.textContent =
                erro.message;

            console.error(
                'Erro ao importar matrículas:',
                erro
            );

        } finally {
            botao.disabled = false;
        }
    }
);

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

carregarTreinamentos();
carregarColaboradores();
carregarTurmas();
