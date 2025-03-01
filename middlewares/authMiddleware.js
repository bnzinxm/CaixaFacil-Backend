import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "ahjhlkjwetihoiteorigboiehbfieborifheoirtbnlk";

/**
 * Middleware de autenticação - Protege rotas privadas.
 * Verifica se o token JWT foi enviado e se é válido.
 * @param {Request} req - Objeto da Requisição HTTP
 * @param {Response} res - Objeto da Resposta HTTP
 * @param {Function} next - Função que chama o próximo middleware.
 */

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        req.user = decoded;

        next();
    }
    catch (err) {
        console.log(err);
        return res.status(403).json({ error: "Token inválido ou expirado." });
    }
};

export default authMiddleware;