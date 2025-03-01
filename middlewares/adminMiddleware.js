import db from '../config/database.js'; // ou o caminho correto do seu banco

const adminMiddleware = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Acesso negado. Usuário não autenticado." });
    }

    try {
        // Supondo que o ID do usuário esteja no token, use-o para consultar o banco
        const { id } = req.user;  // ID do usuário do payload do JWT

        // Query para buscar o cargo do usuário no banco de dados
        const [results] = await db.query('SELECT cargo FROM usuarios WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Verifica se o cargo do usuário é 'admin'
        if (results[0].cargo !== 'admin') {
            return res.status(403).json({ error: "Acesso Restrito. Apenas administradores podem realizar essa ação." });
        }

        next(); // Se for admin, continua o fluxo
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao verificar permissão de administrador.", err });
    }
};

export default adminMiddleware;