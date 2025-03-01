import db from '../config/database.js';

class Products {
    static async GetInfoById(id) {
        const [results] = await db.query("SELECT nome, preco, estoque, categoria FROM produtos WHERE id = ?", [id]);

        if (results.length === 0) {
            return "Não foi possível encontrar o produto! 😢";
        }

        return results[0];
    }

    static async GetPrecoById(id) {
        const [results] = await db.query("SELECT preco FROM produtos WHERE id = ?", [id]);

        if (results.length === 0) {
            return "Não foi possível encontrar o preço do produto! 😢";
        }

        return results[0].preco;
    }
}


export default Products