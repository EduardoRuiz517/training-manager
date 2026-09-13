const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

// LISTAR MATRÍCULAS
router.get('/', (req, res) => {
    const sql = `
        SELECT
            matriculas.id,
            matriculas.turma_id,
            matriculas.data_matricula,
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

// CADASTRAR MATRÍCULA
router.post('/', (req, res) => {
    const {
        turma_id,
        colaborador_id
    } = req.body;

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

                // Evita matrícula duplicada
                if (erro.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        mensagem: 'Este colaborador já está matriculado nesta turma.'
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

module.exports = router;