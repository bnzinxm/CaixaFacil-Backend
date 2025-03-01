const validatePaymentMethod = async (req, res, next) => {
    const metodos = req.query.metodos ? req.query.metodos.split(',') : [];
    console.log(metodos)

    if (!metodos || metodos.length === 0) {
        return res.status(400).json({ error: "Métodos de pagamento não informados." });
    }

    const validPaymentMethods = ["cartao", "pix", "dinheiro", "transferencia"];

    for (let metodo of metodos) {
        if (!validPaymentMethods.includes(metodo)) {
            return res.status(400).json({
                error: `Método de pagamento inválido: ${metodo}`,
                metodo_invalido: metodo
            });
        }
    }

    next();
}

export default validatePaymentMethod;