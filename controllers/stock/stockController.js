import db from '../../config/database.js';

class StockController {
    /**
     * Retorna o estoque de um produto específico.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async getProductStock(req, res) {
        const { id } = req.params; // Agora estamos esperando o ID do produto.

        try {
            const [result] = await db.query("SELECT id, nome, estoque, categoria FROM produtos WHERE id = ?", [id]);

            if (result.length <= 0) {
                return res.status(404).json({ error: "Produto não encontrado." });
            }

            res.status(200).json(result[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar estoque do produto.", err });
        }
    }

    /**
     * Atualiza o estoque do produto.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async adjustStock(req, res) {
        const { id } = req.params; // Agora estamos esperando o ID do produto.
        const { estoque } = req.body;

        if (estoque === undefined) {
            return res.status(400).json({ error: "Estoque é obrigatório." });
        }

        try {
            const [result] = await db.query('UPDATE produtos SET estoque = ? WHERE id = ?', [estoque, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Produto não encontrado!" });
            }

            res.status(200).json({ message: "Estoque atualizado com sucesso!" });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao ajustar estoque do produto.", err });
        }
    }

    /**
     * Retorna todos os produtos de uma categoria filtrados por estoque (do maior para o menor).
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async getCategoryStock(req, res) {
        const { categoria } = req.query; // A categoria vem na query.

        if (!categoria) {
            return res.status(400).json({ error: "Categoria é obrigatória." });
        }

        try {
            const [result] = await db.query("SELECT id, nome, estoque, categoria FROM produtos WHERE categoria = ? ORDER BY estoque DESC", [categoria]);

            if (result.length <= 0) {
                return res.status(404).json({ message: "Nenhum produto encontrado nesta categoria." });
            }

            // Calcular o estoque total da categoria
            const [categoryStockResult] = await db.query("SELECT SUM(estoque) AS total_estoque FROM produtos WHERE categoria = ?", [categoria]);
            const totalEstoque = categoryStockResult[0].total_estoque;

            res.status(200).json({ produtos: result, totalEstoque });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar estoque da categoria.", err });
        }
    }

    /**
     * Atualiza o estoque de todos os produtos de uma categoria.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */
    static async updateCategoryStock(req, res) {
        const { categoria } = req.query; // Categoria vem pela query.
        const { estoque } = req.body; // Novo estoque para os produtos.
    
        if (!categoria) {
            return res.status(400).json({ error: "Categoria é obrigatória." });
        }
    
        if (estoque === undefined) {
            return res.status(400).json({ error: "Campo estoque é obrigatório!" });
        }
    
        try {
            // Listar todos os produtos da categoria
            const [produtos] = await db.query("SELECT id FROM produtos WHERE categoria = ?", [categoria]);
    
            if (produtos.length === 0) {
                return res.status(404).json({ message: "Nenhum produto encontrado nesta categoria." });
            }
    
            // Atualizar o estoque para todos os produtos da categoria
            for (let produto of produtos) {
                const { id } = produto;
    
                await db.query('UPDATE produtos SET estoque = ? WHERE id = ?', [estoque, id]);
            }
    
            res.status(200).json({ message: "Estoque de todos os produtos da categoria atualizado com sucesso!" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao atualizar estoque da categoria.", err });
        }
    }    
}

export default StockController;