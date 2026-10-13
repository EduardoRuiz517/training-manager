const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');

const upload = multer({
    dest: 'uploads/'
});

// LISTAR TREINAMENTOS
router.get('/', (req, res) => {

    const sql = 'SELECT * FROM treinamentos';

    connection.query(sql, (erro, resultados) => {

        if (erro) {
            console.error('Erro ao buscar treinamentos:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar treinamentos.'
            });
        }

        res.json(resultados);
    });
});

// CADASTRAR TREINAMENTO
router.post('/', (req, res) => {

    const {
        nome,
        descricao,
        carga_horaria,
        tipo
    } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).json({
            mensagem: 'Nome do treinamento é obrigatório.'
        });
    }

    const sql = `
        INSERT INTO treinamentos
        (nome, descricao, carga_horaria, tipo)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            nome.trim(),
            descricao || null,
            carga_horaria || null,
            tipo || null
        ],
        (erro, resultado) => {

            if (erro) {
                console.error('Erro ao cadastrar treinamento:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar treinamento.'
                });
            }

            res.status(201).json({
                mensagem: 'Treinamento cadastrado com sucesso!',
                id: resultado.insertId
            });
        }
    );
});

// IMPORTAR TREINAMENTOS POR CSV
router.post('/importar', upload.single('arquivo'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const caminhoArquivo = req.file.path;
    const treinamentos = [];

    try {

        // IDENTIFICAR A CODIFICAÇÃO DO ARQUIVO
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
            `Codificação identificada: ${codificacao}`
        );

        // LER O CSV COM A CODIFICAÇÃO CORRETA
        const conteudoCSV = iconv.decode(buffer, codificacao);

        // TRANSFORMAR O CSV EM REGISTROS
        await new Promise((resolve, reject) => {

            const { Readable } = require('stream');

            Readable.from([conteudoCSV])
                .pipe(csv({
                    separator: ';',
                    mapHeaders: ({ header }) =>
                        header.replace(/^\uFEFF/, '').trim()
                }))
                .on('data', (linha) => {

                    treinamentos.push({
                        nome: linha.nome?.trim(),
                        descricao: linha.descricao?.trim() || null,
                        carga_horaria: linha.carga_horaria?.trim() || null,
                        tipo: linha.tipo?.trim() || null
                    });

                })
                .on('end', resolve)
                .on('error', reject);
        });

        // VALIDAR O CABEÇALHO
        if (
            treinamentos.length > 0 &&
            treinamentos.every(t => !t.nome)
        ) {
            return res.status(400).json({
                mensagem:
                    'Cabeçalho inválido. Utilize: nome;descricao;carga_horaria;tipo'
            });
        }

        let importados = 0;
        let ignorados = 0;

        // INSERIR TREINAMENTOS NO MYSQL
        for (const treinamento of treinamentos) {

            if (!treinamento.nome) {
                ignorados++;
                continue;
            }

            const sql = `
                INSERT INTO treinamentos
                (nome, descricao, carga_horaria, tipo)
                VALUES (?, ?, ?, ?)
            `;

            try {

                await connection.promise().query(
                    sql,
                    [
                        treinamento.nome,
                        treinamento.descricao,
                        treinamento.carga_horaria,
                        treinamento.tipo
                    ]
                );

                importados++;

            } catch (erro) {

                console.error(
                    'Erro ao importar treinamento:',
                    erro
                );

                ignorados++;
            }
        }

        return res.json({
            mensagem: 'Importação concluída.',
            importados,
            ignorados,
            total: treinamentos.length,
            codificacao
        });

    } catch (erro) {

        console.error('Erro ao processar CSV:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao processar arquivo CSV.'
        });

    } finally {

        // EXCLUIR O ARQUIVO TEMPORÁRIO
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