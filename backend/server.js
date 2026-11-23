
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ============================================
// MIDDLEWARES
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// IMPORTAÇÃO DAS ROTAS
// ============================================

// AC1 - Colaboradores e Treinamentos
const colaboradoresRoutes = require('./routes/colaboradores');
const treinamentosRoutes = require('./routes/treinamentos');

// AC2 - Turmas e Matrículas
const turmasRoutes = require('./routes/turmas');
const matriculasRoutes = require('./routes/matriculas');

// AC3 - Dashboard
const dashboardRoutes = require('./routes/dashboard');

// AC4 - Relatórios e Histórico
const relatoriosRoutes = require('./routes/relatorios');
const historicoRoutes = require('./routes/historico');

// ============================================
// REGISTRO DAS ROTAS
// ============================================

app.use('/colaboradores', colaboradoresRoutes);
app.use('/treinamentos', treinamentosRoutes);

app.use('/turmas', turmasRoutes);
app.use('/matriculas', matriculasRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/relatorios', relatoriosRoutes);
app.use('/historico', historicoRoutes);

// ============================================
// ROTA INICIAL
// ============================================

app.get('/', (req, res) => {
    res.send('API Training Manager funcionando!');
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(
        `Servidor Training Manager rodando em http://localhost:${PORT}`
    );
});
