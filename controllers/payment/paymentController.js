import db from '../../config/database.js';

class PaymentController {
    /**
     * Lista todos os pagamentos desde de uma certa data e calcula o total arrecadado.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */

    static async listPayments(req, res) {
        const { dataInicio } = req.query;

        if (!dataInicio) {
            return res.status(400).json({ error: "É necessario foornecer uma data de início." });
        }

        try {
            const [payments] = await db.query(
                "SELECT id, valor, metodo, data FROM pagamentos WHERE data >= ?",
                [dataInicio]
            );

            let total;

            for (let i = 0; i < payments.length; i++) {
                total += payments[i].valor
            }

            res.json({ total, pagamentos: payments });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar pagamentos." });
        }
    }

    /**
     * Busca um pagamento por id.
     * @param {Request} req - Dados da requisição.
     * @param {Response} res - Resposta da API.
     */

    static async getPaymentById(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Faltando campo necessário. (id)" });
        }

        try {
            const [result] = await db.query("SELECT * FROM pagamentos WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Pagamento não encontrado." });
            }

            res.status(200).json(result[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar pagamento por ID.", err });
        }
    }
}

export default PaymentController;