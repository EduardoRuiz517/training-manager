const API_URL = 'http://localhost:3000/colaboradores';

const form = document.getElementById('formColaborador');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaColaboradores');

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

carregarColaboradores();