const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

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

    if (!nome) {
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
        [nome, descricao, carga_horaria, tipo],
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
router.post('/importar', upload.single('arquivo'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            mensagem: 'Nenhum arquivo foi enviado.'
        });
    }

    const treinamentos = [];

    fs.createReadStream(req.file.path)
        .pipe(csv({ separator: ';' }))
        .on('data', (linha) => {

            treinamentos.push({
                nome: linha.nome,
                descricao: linha.descricao || null,
                carga_horaria: linha.carga_horaria || null,
                tipo: linha.tipo || null
            });

        })
        .on('end', async () => {

            let importados = 0;
            let ignorados = 0;

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

            fs.unlink(req.file.path, () => {});

            res.json({
                mensagem: 'Importação concluída.',
                importados: importados,
                ignorados: ignorados,
                total: treinamentos.length
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