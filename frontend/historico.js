
const API_HISTORICO = 'http://localhost:3000/historico';

const campoMatricula = document.getElementById('matriculaPesquisa');
const mensagem = document.getElementById('mensagemHistorico');
const resultado = document.getElementById('resultadoHistorico');
const tabela = document.getElementById('tabelaHistorico');

function formatarData(valor) {
    if (!valor) return '-';

    const data = String(valor).slice(0, 10);
    const partes = data.split('-');

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString('pt-BR');
}

function preencherTexto(id, valor) {
    document.getElementById(id).textContent = valor ?? '-';
}

function mostrarHistorico(dados) {
    const colaborador = dados.colaborador;
    const indicadores = dados.indicadores;

    preencherTexto('nomeColaborador', colaborador.nome);
    preencherTexto('matriculaColaborador', colaborador.matricula);
    preencherTexto('cargoColaborador', colaborador.cargo);
    preencherTexto('lojaColaborador', colaborador.loja);

    preencherTexto(
        'totalMatriculas',
        formatarNumero(indicadores.total_matriculas)
    );

    preencherTexto(
        'totalConcluidos',
        formatarNumero(indicadores.concluidos)
    );

    preencherTexto(
        'totalAusentes',
        formatarNumero(indicadores.ausentes)
    );

    preencherTexto(
        'horasConcluidas',
        formatarNumero(indicadores.horas_concluidas) + ' h'
    );

    preencherTexto(
        'taxaConclusao',
        Number(indicadores.taxa_conclusao || 0)
            .toLocaleString('pt-BR') + '%'
    );

    tabela.innerHTML = '';

    if (dados.historico.length === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 7;
        celula.textContent =
            'Este colaborador ainda não possui matrículas.';

        linha.appendChild(celula);
        tabela.appendChild(linha);
    }

    dados.historico.forEach(item => {
        const linha = document.createElement('tr');

        const valores = [
            item.treinamento,
            item.turma,
            item.carga_horaria,
            formatarData(item.data_inicio),
            formatarData(item.data_fim),
            item.status,
            formatarData(item.data_conclusao)
        ];

        valores.forEach(valor => {
            const celula = document.createElement('td');
            celula.textContent = valor ?? '-';
            linha.appendChild(celula);
        });

        tabela.appendChild(linha);
    });

    resultado.hidden = false;
}

async function pesquisarColaborador() {
    const matricula = campoMatricula.value.trim();

    if (!matricula) {
        mensagem.textContent =
            'Informe uma matrícula para pesquisar.';
        resultado.hidden = true;
        return;
    }

    mensagem.textContent = 'Pesquisando colaborador...';
    resultado.hidden = true;

    try {
        const resposta = await fetch(
            `${API_HISTORICO}/${encodeURIComponent(matricula)}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem || 'Erro ao consultar histórico.'
            );
        }

        mostrarHistorico(dados);

        mensagem.textContent =
            'Histórico carregado com sucesso!';

    } catch (erro) {
        mensagem.textContent = `Erro: ${erro.message}`;
    }
}

document.getElementById('btnPesquisar')
    .addEventListener('click', pesquisarColaborador);

campoMatricula.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        pesquisarColaborador();
    }
});
