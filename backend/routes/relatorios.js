
const express = require('express');
const router = express.Router();
const connection = require('../database/connection');

// GET /relatorios/matriculas
// Consulta matrículas com filtros opcionais.

router.get('/matriculas', async (req, res) => {
    try {
        const {
            treinamento_id,
            turma_id,
            status,
            data_inicio,
            data_fim
        } = req.query;

        const filtros = [];
        const parametros = [];

        if (treinamento_id) {
            filtros.push('t.id = ?');
            parametros.push(treinamento_id);
        }

        if (turma_id) {
            filtros.push('tu.id = ?');
            parametros.push(turma_id);
        }

        if (status) {
            filtros.push('m.status = ?');
            parametros.push(status);
        }

        if (data_inicio) {
            filtros.push('tu.data_inicio >= ?');
            parametros.push(data_inicio);
        }

        if (data_fim) {
            filtros.push('tu.data_inicio <= ?');
            parametros.push(data_fim);
        }

        const where = filtros.length
            ? `WHERE ${filtros.join(' AND ')}`
            : '';

        const sql = `
            SELECT
                m.id AS matricula_id,
                c.matricula,
                c.nome AS colaborador,
                c.cargo,
                c.loja,
                t.nome AS treinamento,
                t.carga_horaria,
                tu.id AS turma_id,
                tu.nome AS turma,
                tu.data_inicio,
                tu.data_fim,
                m.status,
                m.data_conclusao
            FROM matriculas m
            INNER JOIN colaboradores c
                ON c.id = m.colaborador_id
            INNER JOIN turmas tu
                ON tu.id = m.turma_id
            INNER JOIN treinamentos t
                ON t.id = tu.treinamento_id
            ${where}
            ORDER BY c.nome, tu.data_inicio DESC
        `;

        const [resultados] =
            await connection.promise().query(sql, parametros);

        res.json(resultados);

    } catch (erro) {
        console.error('Erro ao consultar relatório:', erro);

        res.status(500).json({
            mensagem: 'Erro ao consultar relatório de matrículas.'
        });
    }
});

module.exports = router;
