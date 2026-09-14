const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// CONFIGURAÇÃO DO UPLOAD
const upload = multer({
    dest: 'uploads/'
});

// LISTAR COLABORADORES
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM colaboradores';

    connection.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar colaboradores:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar colaboradores'
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

    if (!nome || !matricula) {
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
        [nome, matricula, email, cargo, loja],
        (erro, resultado) => {

            if (erro) {
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
router.post('/importar', upload.single('arquivo'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const colaboradores = [];

    fs.createReadStream(req.file.path)
        .pipe(csv({ separator: ';' }))
        .on('data', (linha) => {

            colaboradores.push({
                nome: linha.nome,
                matricula: linha.matricula,
                email: linha.email || null,
                cargo: linha.cargo || null,
                loja: linha.loja || null
            });

        })
        .on('end', async () => {

            let importados = 0;
            let ignorados = 0;

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

                    if (erro.code === 'ER_DUP_ENTRY') {
                        ignorados++;
                    } else {
                        console.error(
                            'Erro ao importar colaborador:',
                            erro
                        );

                        ignorados++;
                    }
                }
            }

            // APAGA O ARQUIVO TEMPORÁRIO
            fs.unlink(req.file.path, () => {});

            res.json({
                mensagem: 'Importação concluída.',
                importados: importados,
                ignorados: ignorados,
                total: colaboradores.length
            });
        })
        .on('error', (erro) => {

            console.error('Erro ao ler CSV:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao processar arquivo CSV.'
            });
        });
});

module.exports = router;