const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');
const { Readable } = require('stream');

// CONFIGURAÇÃO DO UPLOAD
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// LISTAR COLABORADORES
router.get('/', (req, res) => {

    const sql = 'SELECT * FROM colaboradores';

    connection.query(sql, (erro, resultados) => {

        if (erro) {
            console.error('Erro ao buscar colaboradores:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar colaboradores.'
            });
        }

        res.json(resultados);
    });
});

// CADASTRAR COLABORADOR INDIVIDUAL
router.post('/', (req, res) => {

    const {
        nome,
        matricula,
        email,
        cargo,
        loja
    } = req.body;

    if (
        typeof nome !== 'string' ||
        !nome.trim() ||
        !String(matricula ?? '').trim()
    ) {
        return res.status(400).json({
            mensagem: 'Nome e matrícula são obrigatórios.'
        });
    }

    const sql = `
        INSERT INTO colaboradores
        (nome, matricula, email, cargo, loja)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            nome.trim(),
            String(matricula).trim(),
            email || null,
            cargo || null,
            loja || null
        ],
        (erro, resultado) => {

            if (erro) {

                if (erro.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        mensagem: 'Esta matrícula já está cadastrada.'
                    });
                }

                console.error('Erro ao cadastrar colaborador:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar colaborador.'
                });
            }

            res.status(201).json({
                mensagem: 'Colaborador cadastrado com sucesso!',
                id: resultado.insertId
            });
        }
    );
});

// IMPORTAR COLABORADORES POR CSV
router.post('/importar', upload.single('arquivo'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const caminhoArquivo = req.file.path;
    const colaboradores = [];

    try {

        // IDENTIFICAR A CODIFICAÇÃO DO CSV
        const buffer = fs.readFileSync(caminhoArquivo);

        let codificacao = 'utf8';

        try {

            const decoder = new TextDecoder('utf-8', {
                fatal: true
            });

            decoder.decode(buffer);

        } catch (erro) {

            codificacao = 'win1252';
        }

        console.log(
            `Codificação do CSV de colaboradores: ${codificacao}`
        );

        // CONVERTER O ARQUIVO PARA TEXTO
        const conteudoCSV = iconv.decode(buffer, codificacao);

        // LER OS REGISTROS DO CSV
        await new Promise((resolve, reject) => {

            Readable.from([conteudoCSV])
                .pipe(csv({
                    separator: ';',

                    mapHeaders: ({ header }) =>
                        header.replace(/^\uFEFF/, '').trim()
                }))
                .on('data', (linha) => {

                    colaboradores.push({
                        nome: linha.nome?.trim(),
                        matricula: linha.matricula?.trim(),
                        email: linha.email?.trim() || null,
                        cargo: linha.cargo?.trim() || null,
                        loja: linha.loja?.trim() || null
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // VALIDAR O CABEÇALHO
        if (
            colaboradores.length > 0 &&
            colaboradores.every(
                colaborador =>
                    colaborador.nome === undefined ||
                    colaborador.matricula === undefined
            )
        ) {
            return res.status(400).json({
                mensagem:
                    'Cabeçalho inválido. Utilize: nome;matricula;email;cargo;loja'
            });
        }

        let importados = 0;
        let ignorados = 0;

        // IMPORTAR COLABORADORES
        for (const colaborador of colaboradores) {

            if (!colaborador.nome || !colaborador.matricula) {

                ignorados++;
                continue;
            }

            const sql = `
                INSERT INTO colaboradores
                (nome, matricula, email, cargo, loja)
                VALUES (?, ?, ?, ?, ?)
            `;

            try {

                await connection.promise().query(
                    sql,
                    [
                        colaborador.nome,
                        colaborador.matricula,
                        colaborador.email,
                        colaborador.cargo,
                        colaborador.loja
                    ]
                );

                importados++;

            } catch (erro) {

                if (erro.code !== 'ER_DUP_ENTRY') {
                    console.error(
                        'Erro ao importar colaborador:',
                        erro
                    );
                }

                ignorados++;
            }
        }

        return res.json({
            mensagem: 'Importação concluída.',
            total: colaboradores.length,
            importados,
            ignorados,
            codificacao
        });

    } catch (erro) {

        console.error('Erro ao processar CSV:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao processar arquivo CSV.'
        });

    } finally {

        // EXCLUIR ARQUIVO TEMPORÁRIO
        fs.unlink(caminhoArquivo, (erro) => {

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