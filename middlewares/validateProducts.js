import db from '../config/database.js';

const validateProducts = async (req, res, next) => {
    const productIds = req.query.produtos ? req.query.produtos.split(',').map(id => parseInt(id)) : []; // Lista de ID's de produtos.
    console.log(productIds);

    if (productIds.length <= 0) {
        return res.status(400).json({ error: "Lista de produtos inválida ou vazia." });
    }

    try {
        const [result] = await db.query("SELECT id FROM produtos WHERE id IN (?)", [productIds]);

        const foundProducts = new Set(result.map(produto => produto.id));

        const invalidProducts = productIds.filter(id => !foundProducts.has(id));

        if (invalidProducts.length > 0) {
            return res.status(400).json({
                error: "Alguns produtos não foram encontrados!",
                produtos_invalidos: invalidProducts
            });
        }

        next();
   }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao validar produtos.", err });
    }
}

export default validateProducts;