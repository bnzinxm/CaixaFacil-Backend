import db from '../../config/database.js';

class SalesController {
    static async createSale(req, res) {
        try {
            // Dados do corpo da requisição
            const { usuario_id, total } = req.body;
    
            // Validar se todos os parâmetros obrigatórios foram enviados
            if (!usuario_id || !total || total <= 0) {
                return res.status(400).json({ error: "Faltando parâmetros obrigatórios ou valores incorretos." });
            }
    
            // Verificar se o usuário existe
            const [usuario] = await db.query("SELECT id FROM usuarios WHERE id = ?", [usuario_id]);
    
            if (usuario.length === 0) {
                return res.status(400).json({ error: `Usuário com ID ${usuario_id} não encontrado.` });
            }
    
            // Produtos já foram validados pelo middleware
            const produtos = req.query.produtos.split(',').map(id => parseInt(id)); // Os produtos vêm da query string
    
            // 1. Criar a venda
            const queryVenda = "INSERT INTO vendas (usuario_id, total) VALUES (?, ?)";
            const [resultVenda] = await db.query(queryVenda, [usuario_id, total]);
    
            // 2. Criar um array para os produtos vendidos
            const produtosVendidos = [];
            let totalPago = 0; // Variável para armazenar o total pago pelos métodos de pagamento
    
            // 3. Inserir os produtos e verificar o estoque
            for (let produto_id of produtos) {
                const [produto] = await db.query("SELECT * FROM produtos WHERE id = ?", [produto_id]);
    
                if (produto.length === 0) {
                    return res.status(400).json({ error: `Produto com ID ${produto_id} não encontrado.` });
                }
    
                // Verificar se há estoque suficiente
                const quantidade = 1;  // Supondo que o valor seja 1 para cada produto, ajuste conforme necessário
    
                if (produto[0].estoque < quantidade) {
                    return res.status(400).json({ error: `Estoque insuficiente para o produto ID ${produto_id}.` });
                }
    
                const subtotal = produto[0].preco * quantidade;
    
                // Inserir o item na venda
                const queryItemVenda = "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?)";
                await db.query(queryItemVenda, [resultVenda.insertId, produto_id, quantidade, produto[0].preco]);
    
                // Atualizar o estoque do produto
                await db.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [quantidade, produto_id]);
    
                // Adicionar o produto ao array de produtos vendidos
                produtosVendidos.push({
                    produto_id: produto[0].id,
                    nome: produto[0].nome,
                    preco: produto[0].preco,
                    quantidade: quantidade,
                    subtotal: subtotal,
                });
            }
    
            // 4. Criar os pagamentos associados a esta venda
            const metodos = req.query.metodos.split(','); // Métodos de pagamento
            const valores = req.query.valores.split(',').map(val => parseFloat(val)); // Valores pagos
    
            if (metodos.length !== valores.length) {
                return res.status(400).json({ error: 'O número de métodos de pagamento não corresponde ao número de valores fornecidos.' });
            }
    
            // 5. Inserir os pagamentos e calcular o total pago
            for (let i = 0; i < metodos.length; i++) {
                const metodo = metodos[i];
                const valor = valores[i];
    
                if (isNaN(valor)) {
                    return res.status(400).json({ error: "Valor inválido para o método " + metodo });
                }
    
                // Inserir o pagamento
                const queryPagamento = "INSERT INTO pagamentos (venda_id, metodo, valor) VALUES (?, ?, ?)";
                await db.query(queryPagamento, [resultVenda.insertId, metodo, valor]);
    
                // Atualizar o total pago
                totalPago += valor;
            }
    
            // 6. Atualizar a venda com o valor pago
            await db.query("UPDATE vendas SET pago = ? WHERE id = ?", [totalPago, resultVenda.insertId]);
    
            // Resposta estilizada com os dados da venda e dos produtos vendidos
            res.status(201).json({
                message: "Venda criada com sucesso!",
                venda: {
                    id: resultVenda.insertId,
                    usuario_id: usuario_id,
                    total: total, // O total de todos os produtos
                    pago: totalPago, // O total pago
                    produtos: produtosVendidos,
                    pagamentos: metodos.map((metodo, index) => ({
                        metodo,
                        valor: valores[index]
                    })),
                },
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }           

    static async listSales(req, res) {
        try {
            const { operador, data } = req.body;
            let query = "SELECT * FROM vendas WHERE 1=1";
            
            if (operador) query += " AND usuario_id = ?";
            if (data) query += " AND DATE(data_venda) = ?";

            const params = [];
            if (operador) params.push(operador);
            if (data) params.push(data);

            const [vendas] = await db.query(query, params);

            // Carregar os pagamentos associados a cada venda
            for (let venda of vendas) {
                const [pagamentos] = await db.query("SELECT * FROM pagamentos WHERE venda_id = ?", [venda.id]);
                venda.pagamentos = pagamentos;
            }

            res.status(200).json(vendas);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    static async updateSale(req, res) {
        try {
            const { id } = req.params;
            const { usuario_id, total, pagamentos } = req.body;
    
            // Verificar se a venda existe
            if (!id) {
                return res.status(400).json({ error: "ID da venda é obrigatório." });
            }
    
            // Verificar se a venda existe no banco de dados
            const [vendaExistente] = await db.query("SELECT * FROM vendas WHERE id = ?", [id]);
            if (vendaExistente.length === 0) {
                return res.status(404).json({ message: "Venda não encontrada." });
            }
    
            // Atualizar a venda apenas se o total for válido
            if (total && total > 0) {
                const queryVenda = "UPDATE vendas SET usuario_id = ?, total = ? WHERE id = ?";
                const [resultVenda] = await db.query(queryVenda, [usuario_id || vendaExistente[0].usuario_id, total, id]);
            } else {
                const queryVenda = "UPDATE vendas SET usuario_id = ? WHERE id = ?";
                await db.query(queryVenda, [usuario_id || vendaExistente[0].usuario_id, id]);
            }
    
            // Apagar os pagamentos antigos e inserir os novos
            if (pagamentos && pagamentos.length > 0) {
                await db.query("DELETE FROM pagamentos WHERE venda_id = ?", [id]);
    
                for (let pagamento of pagamentos) {
                    const { metodo, valor } = pagamento;
                    if (!metodo || !valor || valor <= 0) {
                        continue; // Ignorar pagamento inválido
                    }
    
                    const queryPagamento = "INSERT INTO pagamentos (venda_id, metodo, valor) VALUES (?, ?, ?)";
                    await db.query(queryPagamento, [id, metodo, valor]);
                }
            }
    
            res.status(200).json({ message: "Venda e pagamentos atualizados com sucesso!" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }    

    static async deleteSale(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Faltando parâmetro obrigatório (id)" });
            }

            const queryVenda = "DELETE FROM vendas WHERE id = ?";
            const [resultVenda] = await db.query(queryVenda, [id]);

            if (resultVenda.affectedRows === 0) {
                return res.status(404).json({ error: "Venda não encontrada." });
            }

            // Apagar os pagamentos associados à venda
            await db.query("DELETE FROM pagamentos WHERE venda_id = ?", [id]);

            res.status(200).json({ message: "Venda e pagamentos deletados com sucesso!" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    static async getSaleById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Parâmetro importante faltando. (id)" });
            }

            const [venda] = await db.query("SELECT * FROM vendas WHERE id = ?", [id]);

            if (venda.length === 0) {
                return res.status(404).json({ error: "Venda não encontrada." });
            }

            const [pagamentos] = await db.query("SELECT * FROM pagamentos WHERE venda_id = ?", [id]);

            venda[0].pagamentos = pagamentos;

            return res.status(200).json(venda[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    static async cancelSale(req, res) {
        const { id } = req.params;

        try {
            const [sale] = await db.query("SELECT id, status FROM vendas WHERE id = ?", [id]);

            if (!sale.length) {
                return res.status(404).json({ error: "Venda não encontrada." });
            }

            if (sale[0].status === 'cancelado') {
                return res.status(400).json({ error: "Essa venda já foi cancelada." });
            }

            await db.query("UPDATE vendas SET status = ? WHERE id = ?", ["cancelado", id]);

            // Cancelar todos os pagamentos associados à venda
            await db.query("UPDATE pagamentos SET status = ? WHERE venda_id = ?", ["cancelado", id]);

            res.status(200).json({ message: "Venda e pagamentos cancelados com sucesso!" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro interno no servidor.", err });
        }
    }

    static async getPaymentStatus(req, res) {
        const { id } = req.params;

        try {
            const [saleResult] = await db.query("SELECT id, total FROM vendas WHERE id = ?",[id]);

            if (saleResult.length === 0) {
                return res.status(404).json({ error: "Venda não encontrada." });
            }

            const sale = saleResult[0];

            const [paymentResult] = await db.query("SELECT valor AS pago, metodo, status FROM pagamentos WHERE venda_id = ?", [id]);

            if (paymentResult.length === 0) {
                return res.status(404).json({ erro: "Nenhum pagamento encontrado para esta venda." });
            }

            const payment = paymentResult[0];

            const troco = Math.max(payment.pago - sale.total, 0);

            res.status(200).json({
                venda_id: sale.id,
                total: sale.total,
                pago: payment.pago,
                troco,
                metodo: payment.metodo,
                status_pagamento: payment.status,
            });
       }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar status do pagamento.", err });
        }
    }
}

export default SalesController;