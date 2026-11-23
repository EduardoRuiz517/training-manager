
const express = require('express');
const router = express.Router();

const connection = require('../database/connection');

// ============================================
// HISTÓRICO DE TREINAMENTOS DO COLABORADOR
// GET /historico/:matricula
// ============================================

router.get('/:matricula', async (req, res) => {
    try {
        const { matricula } = req.params;

        // 1. Localizar o colaborador
        const [colaboradores] = await connection.promise().query(
            `SELECT
                id,
                matricula,
                nome,
                cargo,
                loja,
                status
             FROM colaboradores
             WHERE matricula = ?
             LIMIT 1`,
            [matricula]
        );

        if (colaboradores.length === 0) {
            return res.status(404).json({
                mensagem: 'Colaborador não encontrado.'
            });
        }

        const colaborador = colaboradores[0];

        // 2. Consultar histórico de treinamentos
        const [historico] = await connection.promise().query(
            `SELECT
                m.id AS matricula_id,
                t.nome AS treinamento,
                t.carga_horaria,
                tu.nome AS turma,
                tu.data_inicio,
                tu.data_fim,
                m.status,
                m.data_conclusao
             FROM matriculas m
             INNER JOIN turmas tu
                ON tu.id = m.turma_id
             INNER JOIN treinamentos t
                ON t.id = tu.treinamento_id
             WHERE m.colaborador_id = ?
             ORDER BY tu.data_inicio DESC, m.id DESC`,
            [colaborador.id]
        );

        // 3. Calcular indicadores
        const total = historico.length;

        const concluidos = historico.filter(
            item => item.status === 'Concluído'
        ).length;

        const ausentes = historico.filter(
            item => item.status === 'Ausente'
        ).length;

        const matriculados = historico.filter(
            item => item.status === 'Matriculado'
        ).length;

        const horasConcluidas = historico
            .filter(item => item.status === 'Concluído')
            .reduce(
                (total, item) =>
                    total + Number(item.carga_horaria || 0),
                0
            );

        const taxaConclusao = total > 0
            ? Number(((concluidos / total) * 100).toFixed(2))
            : 0;

        // 4. Retornar dados
        res.json({
            colaborador,

            indicadores: {
                total_matriculas: total,
                concluidos,
                ausentes,
                matriculados,
                horas_concluidas: horasConcluidas,
                taxa_conclusao: taxaConclusao
            },

            historico
        });

    } catch (erro) {
        console.error(
            'Erro ao consultar histórico:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao consultar histórico do colaborador.'
        });
    }
});

module.exports = router;
