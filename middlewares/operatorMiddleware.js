import bcrypt from 'bcryptjs';
import db from '../config/database.js';

/**
 * Middleware de autorização - Permite acesso apenas para administradores ou operadores autenticados.
 * @param {Request} req - Objeto da Requisição HTTP
 * @param {Response} res - Objeto da Resposta HTTP
 * @param {Function} next - Função a ser executada depois desse middleware.
 */

const checkOperatorPassword = async (req, res, next) => {
    const { usuario_id, senha } = req.body;  // Agora o ID do usuário vem do corpo da requisição

    if (!usuario_id || !senha) {
        return res.status(400).json({ error: "ID de usuário e senha são obrigatórios para realizar essa ação." });
    }

    try {
        // Buscando o usuário pelo ID
        const [users] = await db.query("SELECT id, senha, cargo FROM usuarios WHERE id = ?", [usuario_id]);

        console.log(users);

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const user = users[0]; // Pega o primeiro usuário retornado

        // Se o cargo for admin, o acesso é permitido sem verificar a senha
        if (user.cargo === "admin") {
            return next();
        }

        // Compara a senha fornecida com o hash da senha do banco
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(403).json({ error: "Senha incorreta. Acesso negado." });
        }

        // Se a senha for correta, o fluxo prossegue
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno ao verificar a senha.", err });
    }
};

export default checkOperatorPassword;