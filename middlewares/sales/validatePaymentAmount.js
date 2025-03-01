const validatePaymentAmount = (req, res, next) => {
    const pago = req.query.valores ? req.query.valores.split(',').map(val => parseFloat(val)) : []; // Valores pagos
    const total = req.body.total;

    console.log("TOTAL: R$" + JSON.stringify(total) + ", PAGO: R$" + pago);

    // Verificar se o total e os valores pagos são números válidos
    if (typeof total !== "number" || total <= 0 || pago.some(val => typeof val !== "number" || val <= 0)) {
        return res.status(400).json({ error: "Os valores pagos devem ser números positivos." });
    }

    // Somar os valores pagos
    const totalPago = pago.reduce((acc, valor) => acc + valor, 0);

    // Verificar se o valor pago é maior ou igual ao total
    if (totalPago < total) {
        return res.status(400).json({ error: `O total pago (${totalPago}) é menor que o total da venda (${total}).` });
    }

    next();
}

export default validatePaymentAmount;