const API_MATRICULAS = 'http://localhost:3000/matriculas';
const API_COLABORADORES = 'http://localhost:3000/colaboradores';
const API_TURMAS = 'http://localhost:3000/turmas';

const form = document.getElementById('formMatricula');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaMatriculas');

const selectColaborador = document.getElementById('colaborador_id');
const selectTurma = document.getElementById('turma_id');

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
            option.textContent = `${colaborador.nome} - ${colaborador.matricula}`;

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

        selectTurma.innerHTML = `
            <option value="">Selecione a turma</option>
        `;

        turmas.forEach(turma => {
            const option = document.createElement('option');

            option.value = turma.id;
            option.textContent = `${turma.nome} - ${turma.treinamento}`;

            selectTurma.appendChild(option);
        });

    } catch (erro) {
        console.error('Erro ao carregar turmas:', erro);
    }
}

// CARREGAR MATRÍCULAS
async function carregarMatriculas() {
    try {
        const resposta = await fetch(API_MATRICULAS);
        const matriculas = await resposta.json();

        lista.innerHTML = '';

        matriculas.forEach(matricula => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${matricula.id}</td>
                <td>${matricula.colaborador}</td>
                <td>${matricula.matricula}</td>
                <td>${matricula.turma}</td>
                <td>${matricula.treinamento}</td>
                <td>${matricula.status}</td>
            `;

            lista.appendChild(linha);
        });

    } catch (erro) {
        console.error('Erro ao carregar matrículas:', erro);
    }
}

// REALIZAR MATRÍCULA
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const matricula = {
        colaborador_id: document.getElementById('colaborador_id').value,
        turma_id: document.getElementById('turma_id').value
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

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            form.reset();
            carregarMatriculas();
        }

    } catch (erro) {
        mensagem.textContent = 'Erro ao realizar matrícula.';
        console.error(erro);
    }
});

carregarColaboradores();
carregarTurmas();
carregarMatriculas();