const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

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

module.exports = router;