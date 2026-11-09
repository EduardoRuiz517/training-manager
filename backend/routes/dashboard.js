
const express = require('express');
const router = express.Router();
console.log('DASHBOARD AC3 CARREGADO');
const connection = require('../database/connection');

// ============================================
// AC3 - INDICADORES GERAIS
// ============================================

router.get('/resumo', async (req, res) => {
    try {
        const sql = `
            SELECT
                COUNT(*) AS total_matriculas,

                SUM(
                    CASE
                        WHEN status = 'Concluído'
                        THEN 1 ELSE 0
                    END
                ) AS concluidos,

                SUM(
                    CASE
                        WHEN status = 'Ausente'
                        THEN 1 ELSE 0
                    END
                ) AS ausentes,

                SUM(
                    CASE
                        WHEN status = 'Matriculado'
                        THEN 1 ELSE 0
                    END
                ) AS matriculados

            FROM matriculas
        `;

        const [resultados] =
            await connection.promise().query(sql);

        const dados = resultados[0];

        const total = Number(dados.total_matriculas);
        const concluidos = Number(dados.concluidos);
        const ausentes = Number(dados.ausentes);
        const matriculados = Number(dados.matriculados);

        const taxaConclusao = total > 0
            ? Number(((concluidos / total) * 100).toFixed(2))
            : 0;

        res.json({
            total_matriculas: total,
            concluidos,
            ausentes,
            matriculados,
            taxa_conclusao: taxaConclusao
        });

    } catch (erro) {
        console.error('Erro ao gerar resumo:', erro);

        res.status(500).json({
            mensagem: 'Erro ao gerar indicadores.'
        });
    }
});

// ============================================
// AC3 - INDICADORES POR TREINAMENTO
// ============================================

router.get('/treinamentos', async (req, res) => {
    try {
        const sql = `
            SELECT
                treinamentos.id,
                treinamentos.nome AS treinamento,

                COUNT(matriculas.id) AS total_matriculas,

                SUM(
                    CASE
                        WHEN matriculas.status = 'Concluído'
                        THEN 1 ELSE 0
                    END
                ) AS concluidos,

                SUM(
                    CASE
                        WHEN matriculas.status = 'Ausente'
                        THEN 1 ELSE 0
                    END
                ) AS ausentes,

                SUM(
                    CASE
                        WHEN matriculas.status = 'Matriculado'
                        THEN 1 ELSE 0
                    END
                ) AS matriculados

            FROM treinamentos

            LEFT JOIN turmas
                ON turmas.treinamento_id = treinamentos.id

            LEFT JOIN matriculas
                ON matriculas.turma_id = turmas.id

            GROUP BY
                treinamentos.id,
                treinamentos.nome

            ORDER BY treinamentos.nome
        `;

        const [resultados] =
            await connection.promise().query(sql);

        const indicadores = resultados.map(item => {
            const total = Number(item.total_matriculas);
            const concluidos = Number(item.concluidos);

            return {
                id: item.id,
                treinamento: item.treinamento,
                total_matriculas: total,
                concluidos,
                ausentes: Number(item.ausentes),
                matriculados: Number(item.matriculados),
                taxa_conclusao: total > 0
                    ? Number(((concluidos / total) * 100).toFixed(2))
                    : 0
            };
        });

        res.json(indicadores);

    } catch (erro) {
        console.error(
            'Erro ao gerar indicadores por treinamento:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao gerar indicadores por treinamento.'
        });
    }
});

module.exports = router;
