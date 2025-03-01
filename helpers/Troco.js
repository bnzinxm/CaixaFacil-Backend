class Troco {
    static async definirTroco(total, pago) {
        let troco;

        if (total > pago || pago <= 0) {
            throw new Error("O Preço pago deve ser igual ou maior ao total.");
        }

        troco = pago - total;
        return troco;
    }
}

export default Troco;