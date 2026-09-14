const API_URL = 'http://localhost:3000/treinamentos';

const form = document.getElementById('formTreinamento');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaTreinamentos');

const formImportacao = document.getElementById('formImportacao');
const arquivoCSV = document.getElementById('arquivoCSV');
const mensagemImportacao = document.getElementById('mensagemImportacao');

const resultadoImportacao = document.getElementById('resultadoImportacao');
const totalImportacao = document.getElementById('totalImportacao');
const totalImportados = document.getElementById('totalImportados');
const totalIgnorados = document.getElementById('totalIgnorados');


// CARREGAR TREINAMENTOS
async function carregarTreinamentos() {

    try {

        const resposta = await fetch(API_URL);
        const treinamentos = await resposta.json();

        lista.innerHTML = '';

        treinamentos.forEach(treinamento => {

            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${treinamento.id}</td>
                <td>${treinamento.nome}</td>
                <td>${treinamento.descricao || ''}</td>
                <td>${treinamento.carga_horaria || ''}h</td>
                <td>${treinamento.tipo || ''}</td>
                <td>${treinamento.status}</td>
            `;

            lista.appendChild(linha);

        });

    } catch (erro) {

        console.error(
            'Erro ao carregar treinamentos:',
            erro
        );

    }
}


// CADASTRO INDIVIDUAL
form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const treinamento = {

        nome: document.getElementById('nome').value,

        descricao:
            document.getElementById('descricao').value,

        carga_horaria:
            document.getElementById('carga_horaria').value,

        tipo:
            document.getElementById('tipo').value

    };

    try {

        const resposta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(treinamento)

        });

        const dados = await resposta.json();

        mensagem.textContent = dados.mensagem;

        if (resposta.ok) {

            form.reset();

            carregarTreinamentos();

        }

    } catch (erro) {

        mensagem.textContent =
            'Erro ao cadastrar treinamento.';

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
        'Importando treinamentos...';

    resultadoImportacao.style.display = 'none';

    try {

        const resposta = await fetch(`${API_URL}/importar`, {

            method: 'POST',
            body: formData

        });

        const dados = await resposta.json();

        mensagemImportacao.textContent = dados.mensagem;

        if (resposta.ok) {

            totalImportacao.textContent =
                dados.total;

            totalImportados.textContent =
                dados.importados;

            totalIgnorados.textContent =
                dados.ignorados;

            resultadoImportacao.style.display =
                'block';

            formImportacao.reset();

            carregarTreinamentos();
        }

    } catch (erro) {

        mensagemImportacao.textContent =
            'Erro ao importar treinamentos.';

        console.error(erro);

    }

});


carregarTreinamentos();