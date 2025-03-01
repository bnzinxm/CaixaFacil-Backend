import db from './config/database.js';

const testDatabaseConnection = async () => {
    try {
        db.query('SELECT 1', (err, results) => {
            if (err) {
                console.error('Erro ao conectar com o banco de dados:', err);
                return;
            }
            console.log('Conexão com o banco de dados bem-sucedida!');
        });
    } catch (err) {
        console.error('Erro ao tentar conectar com o banco de dados:', err);
    }
};

testDatabaseConnection();