const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

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

// CADASTRAR TURMA
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
            mensagem: 'Treinamento, nome da turma e data de início são obrigatórios.'
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
            data_inicio,
            data_fim || null,
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

module.exports = router;