
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');

// Carregar o .env da raiz do projeto
dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

// Criar conexão com MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Testar conexão
connection.connect((erro) => {
    if (erro) {
        console.error(
            'Erro ao conectar ao MySQL:',
            erro.message
        );
        return;
    }

    console.log('MySQL conectado com sucesso!');
});

module.exports = connection;
