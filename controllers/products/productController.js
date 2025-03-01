import db from '../../config/database.js';

class ProductController {
    /**
     * Lista todos os produtos.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */

    static async listProducts(req, res) {
        try {
            const [results] = await db.query("SELECT id, nome, preco, estoque FROM produtos");
            res.json(results);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar produtos.", err });
        }
    }

    /**
     * Cria um novo produto
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API
     */

    static async createProduct(req, res) {
        const { nome, preco, estoque } = req.body;
        try {
            const [result] = await db.query("INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)", [nome, preco, estoque]);
            res.status(201).json({ message: "Produto criado com sucesso!", id: result.insertId });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao criar produto.", err });
        }
    }

    /**
     * Atualiza um produto por ID.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API
     */

    static async updateProduct(req, res) {
        const { id } = req.params;
        const { nome, preco, estoque } = req.body;

        if (!nome && !preco && !estoque) {
            return res.status(400).json({ error: "Nenhum campo foi informado." });
        }

        try {
            let query = "UPDATE produtos SET ";
            let params = [];
            let updates = [];

            if (nome) {
                updates.push("nome = ?");
                params.push(nome);
            }

            if (preco) {
                updates.push("preco = ?");
                params.push(preco);
            }

            if (estoque) {
                updates.push("estoque = ?");
                params.push(estoque);
            }

            query += updates.join(", ") + " WHERE id = ?";
            params.push(id);

            const [result] = await db.query(query, params) 

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Produto não encontrado!" });
            }

            res.json({ message: "Produto atualizado com sucesso!" });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao atualizar produto.", err });
        }
    }

    /**
     * Exclui um produto.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */

    static async deleteProduct(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Faltando campo necessário (id)" });
        }

        try {
            await db.query("DELETE FROM produtos WHERE id = ?", [id]);
            res.status(200).json({ message: "Produto deletado com sucesso!" });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao deletar produto.", err });
        }
    }

    /**
     * Visualização de um produto por ID.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */

    static async getProductById(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Faltando campo necessário (id)" });
        }

        try {
            const [result] = await db.query("SELECT id, nome, preco, estoque, categoria FROM produtos WHERE id = ?", [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Produto não encontrado." });
            }

            res.status(200).json(result[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar o produto.", err });
        }
    }
}

export default ProductController;