import db from "../../config/database.js";

const validateStocksAvailability = async (req, res, next) => {
    const produtos = req.query.produtos ? req.query.produtos.split(',').map(id => parseInt(id)) : []; // Garantir que seja um array de números inteiros.

    // Verificar se produtos é realmente um array antes de tentar iterar
    if (!Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ error: "A lista de produtos não é válida ou está vazia." });
    }

    try {
        // Verificar disponibilidade de estoque para cada produto
        for (let produto_id of produtos) {
            const [produto] = await db.query("SELECT * FROM produtos WHERE id = ?", [produto_id]);

            if (produto.length === 0) {
                return res.status(400).json({ error: `Produto com ID ${produto_id} não encontrado.` });
            }

            if (produto[0].estoque <= 0) {
                return res.status(400).json({ error: `Produto com ID ${produto_id} está fora de estoque.` });
            }
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao validar estoque dos produtos.", err });
    }
};

export default validateStocksAvailability;