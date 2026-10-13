
const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');
const { Readable } = require('stream');

// CONFIGURAÇÃO DE UPLOAD
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// NORMALIZAR DATAS
// Aceita DD/MM/AAAA e AAAA-MM-DD
function normalizarData(valor) {
    if (!valor) return null;

    let data = String(valor).trim();

    const formatoBR = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);

    if (formatoBR) {
        const [, dia, mes, ano] = formatoBR;
        data = `${ano}-${mes}-${dia}`;
    }

    const formatoISO = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);

    if (!formatoISO) return null;

    const [, ano, mes, dia] = formatoISO;

    const anoNumero = Number(ano);
    const mesNumero = Number(mes);
    const diaNumero = Number(dia);

    const dataUTC = new Date(0);

    dataUTC.setUTCHours(0, 0, 0, 0);
    dataUTC.setUTCFullYear(
        anoNumero,
        mesNumero - 1,
        diaNumero
    );

    if (
        anoNumero < 1000 ||
        dataUTC.getUTCFullYear() !== anoNumero ||
        dataUTC.getUTCMonth() !== mesNumero - 1 ||
        dataUTC.getUTCDate() !== diaNumero
    ) {
        return null;
    }

    return data;
}

// LISTAR TURMAS
router.get('/', (req, res) => {
    const sql = `
        SELECT
            turmas.id,
            turmas.nome,
            turmas.data_inicio,
            turmas.data_fim,
            turmas.horario,
            turmas.local,
            turmas.vagas,
            turmas.status,
            treinamentos.nome AS treinamento
        FROM turmas
        INNER JOIN treinamentos
            ON turmas.treinamento_id = treinamentos.id
        ORDER BY turmas.data_inicio
    `;

    connection.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar turmas:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar turmas.'
            });
        }

        res.json(resultados);
    });
});

// CADASTRAR TURMA INDIVIDUAL
router.post('/', (req, res) => {
    const {
        treinamento_id,
        nome,
        data_inicio,
        data_fim,
        horario,
        local,
        vagas
    } = req.body;

    if (!treinamento_id || !nome || !data_inicio) {
        return res.status(400).json({
            mensagem:
                'Treinamento, nome da turma e data de início são obrigatórios.'
        });
    }

    const dataInicio = normalizarData(data_inicio);
    const dataFim = data_fim ? normalizarData(data_fim) : null;

    if (!dataInicio) {
        return res.status(400).json({
            mensagem: 'Data de início inválida.'
        });
    }

    if (data_fim && (!dataFim || dataFim < dataInicio)) {
        return res.status(400).json({
            mensagem: 'Data de término inválida ou anterior ao início.'
        });
    }

    const sql = `
        INSERT INTO turmas
        (
            treinamento_id,
            nome,
            data_inicio,
            data_fim,
            horario,
            local,
            vagas
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            treinamento_id,
            nome,
            dataInicio,
            dataFim,
            horario || null,
            local || null,
            vagas || null
        ],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar turma:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar turma.'
                });
            }

            res.status(201).json({
                mensagem: 'Turma cadastrada com sucesso!',
                id: resultado.insertId
            });
        }
    );
});

// IMPORTAÇÃO EM LOTE DE TURMAS
router.post('/importar', upload.single('arquivo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const caminhoArquivo = req.file.path;
    const turmas = [];

    try {
        // LER ARQUIVO
        const buffer = fs.readFileSync(caminhoArquivo);

        // DETECTAR CODIFICAÇÃO
        let codificacao = 'utf8';

        try {
            const decoder = new TextDecoder('utf-8', {
                fatal: true
            });

            decoder.decode(buffer);
        } catch (erro) {
            codificacao = 'win1252';
        }

        const conteudoCSV = iconv.decode(buffer, codificacao);

        let cabecalhos = [];

        // PROCESSAR CSV
        await new Promise((resolve, reject) => {
            Readable.from([conteudoCSV])
                .pipe(csv({
                    separator: ';',
                    mapHeaders: ({ header }) =>
                        header.replace(/^\uFEFF/, '').trim()
                }))
                .on('headers', headers => {
                    cabecalhos = headers;
                })
                .on('data', linha => {
                    turmas.push({
                        treinamento: linha.treinamento?.trim(),
                        nome: linha.nome?.trim(),
                        data_inicio: linha.data_inicio?.trim(),
                        data_fim: linha.data_fim?.trim() || null,
                        horario: linha.horario?.trim() || null,
                        local: linha.local?.trim() || null,
                        vagas: linha.vagas?.trim() || null
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // VALIDAR CABEÇALHOS
        const obrigatorios = [
            'treinamento',
            'nome',
            'data_inicio'
        ];

        if (!obrigatorios.every(campo => cabecalhos.includes(campo))) {
            return res.status(400).json({
                mensagem:
                    'Cabeçalho inválido. Campos obrigatórios: treinamento;nome;data_inicio'
            });
        }

        let importados = 0;
        let ignorados = 0;

        const detalhes = [];

        // PROCESSAR CADA TURMA
        for (let i = 0; i < turmas.length; i++) {
            const turma = turmas[i];
            const linhaCSV = i + 2;

            const dataInicio = normalizarData(turma.data_inicio);

            const dataFim = turma.data_fim
                ? normalizarData(turma.data_fim)
                : null;

            let motivo = null;

            // VALIDAR CAMPOS OBRIGATÓRIOS
            if (
                !turma.treinamento ||
                !turma.nome ||
                !turma.data_inicio
            ) {
                motivo = 'Campos obrigatórios não preenchidos.';
            }

            // VALIDAR DATA DE INÍCIO
            else if (!dataInicio) {
                motivo =
                    'Data de início inválida. Use DD/MM/AAAA ou AAAA-MM-DD.';
            }

            // VALIDAR DATA DE TÉRMINO
            else if (
                turma.data_fim &&
                (!dataFim || dataFim < dataInicio)
            ) {
                motivo =
                    'Data de término inválida ou anterior ao início.';
            }

            // VALIDAR HORÁRIO
            else if (
                turma.horario &&
                !/^([01]\d|2[0-3]):[0-5]\d$/.test(turma.horario)
            ) {
                motivo = 'Horário inválido. Use HH:MM.';
            }

            // VALIDAR VAGAS (OPCIONAL)
            else if (
                turma.vagas &&
                (
                    !/^\d+$/.test(turma.vagas) ||
                    Number(turma.vagas) < 1
                )
            ) {
                motivo = 'Quantidade de vagas inválida.';
            }

            if (motivo) {
                ignorados++;

                detalhes.push({
                    linha: linhaCSV,
                    treinamento: turma.treinamento || '',
                    motivo
                });

                continue;
            }

            try {
                // LOCALIZAR TREINAMENTO PELO NOME
                const [treinamentos] = await connection.promise().query(
                    `
                    SELECT id
                    FROM treinamentos
                    WHERE nome = ?
                    `,
                    [turma.treinamento]
                );

                if (treinamentos.length === 0) {
                    motivo = 'Treinamento não encontrado.';
                } else if (treinamentos.length > 1) {
                    motivo =
                        'Existe mais de um treinamento com esse nome.';
                }

                if (motivo) {
                    ignorados++;

                    detalhes.push({
                        linha: linhaCSV,
                        treinamento: turma.treinamento,
                        motivo
                    });

                    continue;
                }

                const treinamentoId = treinamentos[0].id;

                // VERIFICAR SE A TURMA JÁ EXISTE
                const [existentes] = await connection.promise().query(
                    `
                    SELECT id
                    FROM turmas
                    WHERE treinamento_id = ?
                      AND nome = ?
                      AND data_inicio = ?
                    LIMIT 1
                    `,
                    [
                        treinamentoId,
                        turma.nome,
                        dataInicio
                    ]
                );

                if (existentes.length > 0) {
                    ignorados++;

                    detalhes.push({
                        linha: linhaCSV,
                        treinamento: turma.treinamento,
                        motivo: 'Turma já cadastrada.'
                    });

                    continue;
                }

                // CADASTRAR TURMA
                await connection.promise().query(
                    `
                    INSERT INTO turmas
                    (
                        treinamento_id,
                        nome,
                        data_inicio,
                        data_fim,
                        horario,
                        local,
                        vagas
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        treinamentoId,
                        turma.nome,
                        dataInicio,
                        dataFim,
                        turma.horario,
                        turma.local,
                        turma.vagas
                            ? Number(turma.vagas)
                            : null
                    ]
                );

                importados++;

            } catch (erro) {
                console.error(
                    'Erro ao importar turma:',
                    erro
                );

                ignorados++;

                detalhes.push({
                    linha: linhaCSV,
                    treinamento: turma.treinamento,
                    motivo: 'Erro ao gravar turma no banco.'
                });
            }
        }

        return res.json({
            mensagem: 'Importação de turmas concluída.',
            total: turmas.length,
            importados,
            ignorados,
            codificacao,
            detalhes
        });

    } catch (erro) {
        console.error('Erro ao processar CSV:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao processar arquivo CSV.'
        });

    } finally {
        // EXCLUIR ARQUIVO TEMPORÁRIO
        fs.unlink(caminhoArquivo, erro => {
            if (erro) {
                console.error(
                    'Erro ao excluir arquivo temporário:',
                    erro
                );
            }
        });
    }
});

module.exports = router;
