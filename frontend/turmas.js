const API_TURMAS = 'http://localhost:3000/turmas';
const API_TREINAMENTOS = 'http://localhost:3000/treinamentos';
const API_COLABORADORES = 'http://localhost:3000/colaboradores';
const API_MATRICULAS = 'http://localhost:3000/matriculas';

const formTurma = document.getElementById('formTurma');
const mensagem = document.getElementById('mensagem');
const listaTurmas = document.getElementById('listaTurmas');
const selectTreinamento = document.getElementById('treinamento_id');

const areaParticipantes = document.getElementById('areaParticipantes');
const tituloParticipantes = document.getElementById('tituloParticipantes');
const formMatricula = document.getElementById('formMatricula');
const selectColaborador = document.getElementById('colaborador_id');
const mensagemMatricula = document.getElementById('mensagemMatricula');
const listaParticipantes = document.getElementById('listaParticipantes');

let turmaSelecionadaId = null;
let turmaSelecionadaNome = '';

// CARREGAR TREINAMENTOS
async function carregarTreinamentos() {
    try {
        const resposta = await fetch(API_TREINAMENTOS);
        const treinamentos = await resposta.json();

        selectTreinamento.innerHTML = `
            <option value="">Selecione o treinamento</option>
        `;

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
        const resposta = await fetch(API_COLABORADORES);
        const colaboradores = await resposta.json();

        selectColaborador.innerHTML = `
            <option value="">Selecione o colaborador</option>
        `;

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

// CARREGAR TURMAS
async function carregarTurmas() {
    try {
        const resposta = await fetch(API_TURMAS);
        const turmas = await resposta.json();

        listaTurmas.innerHTML = '';

        turmas.forEach(turma => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${turma.id}</td>
                <td>${turma.nome}</td>
                <td>${turma.treinamento}</td>
                <td>${formatarData(turma.data_inicio)}</td>
                <td>${turma.horario || ''}</td>
                <td>${turma.local || ''}</td>
                <td>${turma.vagas || ''}</td>
                <td>${turma.status}</td>
                <td>
                    <button
                        type="button"
                        onclick="gerenciarTurma(${turma.id}, '${escaparTexto(turma.nome)}')"
                    >
                        Gerenciar
                    </button>
                </td>
            `;

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
        treinamento_id: document.getElementById('treinamento_id').value,
        nome: document.getElementById('nome').value,
        data_inicio: document.getElementById('data_inicio').value,
        data_fim: document.getElementById('data_fim').value,
        horario: document.getElementById('horario').value,
        local: document.getElementById('local').value,
        vagas: document.getElementById('vagas').value
    };

    try {
        const resposta = await fetch(API_TURMAS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(turma)
        });

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            formTurma.reset();
            carregarTurmas();
        }

    } catch (erro) {
        mensagem.textContent = 'Erro ao cadastrar turma.';
        console.error(erro);
    }
});

// ABRIR GERENCIAMENTO DA TURMA
async function gerenciarTurma(id, nome) {
    turmaSelecionadaId = id;
    turmaSelecionadaNome = nome;

    areaParticipantes.style.display = 'block';

    tituloParticipantes.textContent =
        `Participantes da Turma - ${nome}`;

    mensagemMatricula.textContent = '';

    await carregarParticipantes();

    areaParticipantes.scrollIntoView({
        behavior: 'smooth'
    });
}

// CARREGAR PARTICIPANTES DA TURMA
async function carregarParticipantes() {
    try {
        const resposta = await fetch(API_MATRICULAS);
        const matriculas = await resposta.json();

        listaParticipantes.innerHTML = '';

        const participantesTurma = matriculas.filter(
            matricula => String(matricula.turma_id) === String(turmaSelecionadaId)
        );

        participantesTurma.forEach(matricula => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${matricula.colaborador}</td>
                <td>${matricula.matricula}</td>
                <td>${matricula.status}</td>
            `;

            listaParticipantes.appendChild(linha);
        });

        if (participantesTurma.length === 0) {
            listaParticipantes.innerHTML = `
                <tr>
                    <td colspan="3">
                        Nenhum participante matriculado nesta turma.
                    </td>
                </tr>
            `;
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
        const resposta = await fetch(API_MATRICULAS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(matricula)
        });

        const dados = await resposta.json();

        mensagemMatricula.textContent = dados.mensagem;

        if (resposta.ok) {
            formMatricula.reset();
            carregarParticipantes();
        }

    } catch (erro) {
        mensagemMatricula.textContent =
            'Erro ao adicionar participante.';
        console.error(erro);
    }
});

// FORMATAR DATA
function formatarData(data) {
    if (!data) {
        return '';
    }

    return new Date(data).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    });
}

// EVITA PROBLEMAS COM ASPAS NO NOME DA TURMA
function escaparTexto(texto) {
    return texto
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
}

carregarTreinamentos();
carregarColaboradores();
carregarTurmas();