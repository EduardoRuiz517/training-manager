require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:', erro.message);
        return;
    }

    console.log('Conectado ao MySQL com sucesso!');
});

module.exports = connection;