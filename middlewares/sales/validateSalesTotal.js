const validateSalesTotal = (req, res, next) => {
    const { total } = req.body;

    if (typeof total !== "number" || total <= 0) {
        return res.status(400).json({ error: "O Total da venda deve ser um número positivo." });
    }

    next();
}

export default validateSalesTotal;