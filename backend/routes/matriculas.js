
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

// ============================================
// LISTAR MATRÍCULAS
// ============================================

router.get('/', (req, res) => {
    const sql = `
        SELECT
            matriculas.id,
            matriculas.turma_id,
            matriculas.data_matricula,
            matriculas.data_conclusao,
            matriculas.status,
            colaboradores.nome AS colaborador,
            colaboradores.matricula,
            turmas.nome AS turma,
            treinamentos.nome AS treinamento
        FROM matriculas
        INNER JOIN colaboradores
            ON matriculas.colaborador_id = colaboradores.id
        INNER JOIN turmas
            ON matriculas.turma_id = turmas.id
        INNER JOIN treinamentos
            ON turmas.treinamento_id = treinamentos.id
        ORDER BY matriculas.id DESC
    `;

    connection.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar matrículas:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar matrículas.'
            });
        }

        res.json(resultados);
    });
});

// ============================================
// CADASTRAR MATRÍCULA INDIVIDUAL
// ============================================

router.post('/', (req, res) => {
    const { turma_id, colaborador_id } = req.body;

    if (!turma_id || !colaborador_id) {
        return res.status(400).json({
            mensagem: 'Turma e colaborador são obrigatórios.'
        });
    }

    const sql = `
        INSERT INTO matriculas
        (turma_id, colaborador_id)
        VALUES (?, ?)
    `;

    connection.query(
        sql,
        [turma_id, colaborador_id],
        (erro, resultado) => {
            if (erro) {
                if (erro.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        mensagem:
                            'Este colaborador já está matriculado nesta turma.'
                    });
                }

                console.error('Erro ao cadastrar matrícula:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar matrícula.'
                });
            }

            res.status(201).json({
                mensagem: 'Matrícula realizada com sucesso!',
                id: resultado.insertId
            });
        }
    );
});

// ============================================
// IMPORTAÇÃO EM LOTE DE MATRÍCULAS
// ============================================

router.post('/importar', upload.single('arquivo'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const caminhoArquivo = req.file.path;
    const registros = [];

    try {
        // LER ARQUIVO
        const buffer = fs.readFileSync(caminhoArquivo);

        // DETECTAR CODIFICAÇÃO DO CSV
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
                    registros.push({
                        matricula: linha.matricula?.trim(),
                        turma_id: linha.turma_id?.trim()
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // VALIDAR CABEÇALHOS
        const obrigatorios = [
            'matricula',
            'turma_id'
        ];

        if (!obrigatorios.every(campo => cabecalhos.includes(campo))) {
            return res.status(400).json({
                mensagem:
                    'Cabeçalho inválido. Utilize: matricula;turma_id'
            });
        }

        let importados = 0;
        let ignorados = 0;

        const detalhes = [];

        // PROCESSAR CADA MATRÍCULA
        for (let i = 0; i < registros.length; i++) {
            const registro = registros[i];
            const linhaCSV = i + 2;

            let motivo = null;

            // VALIDAR CAMPOS
            if (!registro.matricula || !registro.turma_id) {
                motivo = 'Matrícula ou turma não informada.';
            } else if (
                !/^\d+$/.test(registro.turma_id) ||
                Number(registro.turma_id) < 1 ||
                !Number.isSafeInteger(Number(registro.turma_id))
            ) {
                motivo = 'ID da turma inválido.';
            }

            if (motivo) {
                ignorados++;

                detalhes.push({
                    linha: linhaCSV,
                    matricula: registro.matricula || '',
                    turma_id: registro.turma_id || '',
                    motivo
                });

                continue;
            }

            try {
                // LOCALIZAR COLABORADOR
                const [colaboradores] =
                    await connection.promise().query(
                        `
                        SELECT id
                        FROM colaboradores
                        WHERE matricula = ?
                        LIMIT 1
                        `,
                        [registro.matricula]
                    );

                if (colaboradores.length === 0) {
                    motivo = 'Colaborador não encontrado.';
                }

                // LOCALIZAR TURMA
                const [turmas] =
                    await connection.promise().query(
                        `
                        SELECT id
                        FROM turmas
                        WHERE id = ?
                        LIMIT 1
                        `,
                        [Number(registro.turma_id)]
                    );

                if (turmas.length === 0) {
                    motivo = motivo
                        ? `${motivo} Turma não encontrada.`
                        : 'Turma não encontrada.';
                }

                if (motivo) {
                    ignorados++;

                    detalhes.push({
                        linha: linhaCSV,
                        matricula: registro.matricula,
                        turma_id: registro.turma_id,
                        motivo
                    });

                    continue;
                }

                const colaboradorId = colaboradores[0].id;
                const turmaId = turmas[0].id;

                // CADASTRAR MATRÍCULA
                // A RESTRIÇÃO UNIQUE IMPEDE DUPLICIDADES
                await connection.promise().query(
                    `
                    INSERT INTO matriculas
                    (turma_id, colaborador_id)
                    VALUES (?, ?)
                    `,
                    [turmaId, colaboradorId]
                );

                importados++;

            } catch (erro) {
                ignorados++;

                if (erro.code === 'ER_DUP_ENTRY') {
                    motivo =
                        'Colaborador já matriculado nesta turma.';
                } else {
                    console.error(
                        'Erro ao importar matrícula:',
                        erro
                    );

                    motivo = 'Erro ao gravar matrícula no banco.';
                }

                detalhes.push({
                    linha: linhaCSV,
                    matricula: registro.matricula,
                    turma_id: registro.turma_id,
                    motivo
                });
            }
        }

        return res.json({
            mensagem: 'Importação de matrículas concluída.',
            total: registros.length,
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

// ============================================
// AC3 - ATUALIZAR STATUS DA MATRÍCULA
// ============================================

router.put('/:id/status', async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    const statusPermitidos = [
        'Matriculado',
        'Concluído',
        'Ausente'
    ];

    // VALIDAR ID
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            mensagem: 'ID da matrícula inválido.'
        });
    }

    // VALIDAR STATUS
    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({
            mensagem:
                'Status inválido. Utilize Matriculado, Concluído ou Ausente.'
        });
    }

    try {
        const sql = `
            UPDATE matriculas
            SET
                status = ?,
                data_conclusao = CASE
                    WHEN ? = 'Concluído'
                    THEN COALESCE(data_conclusao, CURDATE())
                    ELSE NULL
                END
            WHERE id = ?
        `;

        const [resultado] = await connection.promise().query(
            sql,
            [status, status, id]
        );

        // VERIFICAR SE A MATRÍCULA EXISTE
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Matrícula não encontrada.'
            });
        }

        // CONSULTAR DADOS ATUALIZADOS
        const [matriculas] = await connection.promise().query(
            `
            SELECT
                id,
                turma_id,
                colaborador_id,
                status,
                data_conclusao
            FROM matriculas
            WHERE id = ?
            `,
            [id]
        );

        return res.json({
            mensagem: 'Status atualizado com sucesso!',
            matricula: matriculas[0]
        });

    } catch (erro) {
        console.error('Erro ao atualizar status:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar o status da matrícula.'
        });
    }
});

module.exports = router;
