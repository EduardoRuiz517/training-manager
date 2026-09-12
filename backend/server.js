const express = require('express');
const cors = require('cors');
const connection = require('./database/connection');
const colaboradoresRoutes = require('./routes/colaboradores');
const treinamentosRoutes = require('./routes/treinamentos');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/colaboradores', colaboradoresRoutes);
app.use('/treinamentos', treinamentosRoutes);

app.get('/', (req, res) => {
    res.send('Training Manager API funcionando!');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});