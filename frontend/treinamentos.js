const API_URL = 'http://localhost:3000/treinamentos';

const form = document.getElementById('formTreinamento');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaTreinamentos');

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


carregarTreinamentos();