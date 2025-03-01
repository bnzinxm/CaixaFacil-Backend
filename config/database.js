import mysql from 'mysql2/promise'; // Certifique-se de importar a versão de promise

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: 'root',
    password: '98452489',
    database: 'caixafacil',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;
