import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import db from '../../config/database.js'; // Supondo que você já tenha um arquivo para configuração do DB

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "ahjhlkjwetihoiteorigboiehbfieborifheoirtbnlk";

/**
 * Controller de autenticação - Gerencia login e registro de usuários.
 */

function generateUniqueToken(userEmail) {
    return crypto.createHash('sha256').update(userEmail).digest('hex')
}

class AuthController {
    /**
     * Registra um novo usuário
     * @param {Request} req - Dados da requisição
     * @param {Response} res - Resposta da API
     */

    static async register(req, res) {
        try {
            const { nome, email, senha, cargo } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ message: "Preencha todos os campos." });
            }

            // Verifica se o e-mail já está registrado
            const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
            if (rows.length > 0) {
                return res.status(400).json({ error: "E-mail já cadastrado!" });
            }

            // Criptografa a senha
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Insere o novo usuário no banco de dados
            const query = "INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)";
            await db.query(query, [nome, email, hashedPassword, cargo]);

            res.status(201).json({
                status: "success",
                message: "Usuário registrado com sucesso!",
                data: {
                    user: {
                        nome: nome,
                        email: email,
                        cargo: cargo,
                        registrationTime: new Date().toISOString()
                    }
                }
            });
            
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    /**
     * Faz login e retorna um token JWT.
     * @param {Request} req - Dados da requisição
     * @param {Response} res - Resposta da API
     */

    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Verifica se o usuário existe
            const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Usuário não encontrado!" });
            }

            // Compara a senha informada com a armazenada no banco
            const passwordMatch = await bcrypt.compare(senha, rows[0].senha);
            if (!passwordMatch) {
                return res.status(400).json({ error: "E-mail ou senha incorretos!" });
            }

            // Gera o token JWT
            const token = jwt.sign({ id: rows[0].id, cargo: rows[0].cargo }, JWT_SECRET, {
                expiresIn: '7d',
            });

            res.json({
                status: "success",
                message: "Login realizado com sucesso!",
                data: {
                    user: {
                        id: rows[0].id,
                        nome: rows[0].nome,
                        email: rows[0].email,
                        cargo: rows[0].cargo,
                        loginTime: new Date().toISOString()
                    },
                    token: token
                }
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }
}

export default AuthController;