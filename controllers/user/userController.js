import db from '../../config/database.js';

class UserController {
    /**
     * Lista todos os usuários.
     * @param {Request} req - Dados da requisição
     * @param {Response} res - Resposta da API
     */
    static async getAllUsers(req, res) {
        try {
            const [results] = await db.query("SELECT id, nome, email, cargo, criado_em FROM usuarios");
            res.json(results);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar usuários.", err });
        }
    }

    /**
     * Busca um usuário pelo id. (Admin)
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const [results] = await db.query('SELECT id, nome, email, cargo, criado_em FROM usuarios WHERE id = ?', [id]);
            
            if (results.length === 0) {
                return res.status(404).json({ error: "Usuário não encontrado." });
            }

            res.json(results[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    /**
     * Edita um usuário por ID (Admin)
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async updateUser(req, res) {
        const { id } = req.params;
        const { nome, cargo, email } = req.body;

        // Verifica os campos fornecidos e faz a atualização apenas dos campos presentes
        let updateFields = [];
        let updateValues = [];

        if (nome) {
            updateFields.push("nome = ?");
            updateValues.push(nome);
        }

        if (cargo) {
            updateFields.push("cargo = ?");
            updateValues.push(cargo);
        }

        if (email) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: "Nenhum campo fornecido para atualização." });
        }

        updateValues.push(id);

        try {
            const query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
            await db.query(query, updateValues);
            res.json({ message: "Usuário editado com sucesso!" });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao editar usuário." });
        }
    }

    /**
     * Deleta um usuário por ID (Admin)
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async deleteUser(req, res) {
        const { id } = req.params;

        try {
            await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
            res.json({ message: "Usuário deletado com sucesso!" });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao deletar usuário.", err });
        }
    }
}

export default UserController;
