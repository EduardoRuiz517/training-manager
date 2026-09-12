const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

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
router.post('/', (req, res) => {
    const { nome, matricula, email, cargo, loja } = req.body;

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
module.exports = router;