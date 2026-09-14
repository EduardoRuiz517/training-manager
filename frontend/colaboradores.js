const API_URL = 'http://localhost:3000/colaboradores';

const form = document.getElementById('formColaborador');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaColaboradores');

const formImportacao = document.getElementById('formImportacao');
const arquivoCSV = document.getElementById('arquivoCSV');
const mensagemImportacao = document.getElementById('mensagemImportacao');

const resultadoImportacao = document.getElementById('resultadoImportacao');
const totalImportacao = document.getElementById('totalImportacao');
const totalImportados = document.getElementById('totalImportados');
const totalIgnorados = document.getElementById('totalIgnorados');


// CARREGAR COLABORADORES
async function carregarColaboradores() {
    try {
        const resposta = await fetch(API_URL);
        const colaboradores = await resposta.json();

        lista.innerHTML = '';

        colaboradores.forEach(colaborador => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${colaborador.id}</td>
                <td>${colaborador.nome}</td>
                <td>${colaborador.matricula}</td>
                <td>${colaborador.email || ''}</td>
                <td>${colaborador.cargo || ''}</td>
                <td>${colaborador.loja || ''}</td>
                <td>${colaborador.status}</td>
            `;

            lista.appendChild(linha);
        });

    } catch (erro) {
        console.error('Erro ao carregar colaboradores:', erro);
    }
}


// CADASTRO INDIVIDUAL
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const colaborador = {
        nome: document.getElementById('nome').value,
        matricula: document.getElementById('matricula').value,
        email: document.getElementById('email').value,
        cargo: document.getElementById('cargo').value,
        loja: document.getElementById('loja').value
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(colaborador)
        });

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {
            form.reset();
            carregarColaboradores();
        }

    } catch (erro) {
        mensagem.textContent = 'Erro ao cadastrar colaborador.';
        console.error(erro);
    }
});


// IMPORTAÇÃO EM LOTE
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

    mensagemImportacao.textContent =
        'Importando colaboradores...';

    resultadoImportacao.style.display = 'none';

    try {

        const resposta = await fetch(`${API_URL}/importar`, {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        mensagemImportacao.textContent = dados.mensagem;

        if (resposta.ok) {

            totalImportacao.textContent = dados.total;
            totalImportados.textContent = dados.importados;
            totalIgnorados.textContent = dados.ignorados;

            resultadoImportacao.style.display = 'block';

            formImportacao.reset();

            carregarColaboradores();
        }

    } catch (erro) {

        mensagemImportacao.textContent =
            'Erro ao importar colaboradores.';

        console.error(erro);
    }
});


carregarColaboradores();