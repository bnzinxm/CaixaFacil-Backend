import db from "../../config/database.js";
import dayjs from "dayjs";

const relatoriesController = {
  // Relatório de vendas
  async getVendas(req, res) {
    try {
      // Data inicial para o cálculo (pode ser um parâmetro futuramente)
      const dataInicial = "2024-01-01"; 

      // Total de vendas desde uma data específica
      const [totalVendas] = await db.query(
        "SELECT COUNT(*) AS total, SUM(total) AS total_revenue FROM vendas WHERE data >= ?",
        [dataInicial]
      );

      // Média de vendas por dia
      const [mediaDiaria] = await db.query(
        "SELECT AVG(total) AS media_diaria FROM vendas WHERE data >= ? GROUP BY DATE(data)",
        [dataInicial]
      );

      // Média de vendas por mês
      const [mediaMensal] = await db.query(
        "SELECT AVG(total) AS media_mensal FROM vendas WHERE data >= ? GROUP BY MONTH(data)",
        [dataInicial]
      );

      res.status(200).json({
        total_vendas: totalVendas[0].total || 0,
        total_revenue: totalVendas[0].total_revenue || 0,
        media_diaria: mediaDiaria.length ? mediaDiaria[0].media_diaria : 0,
        media_mensal: mediaMensal.length ? mediaMensal[0].media_mensal : 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar o relatório de vendas." });
    }
  },

  // Relatório de estoque
  async getEstoque(req, res) {
    try {
      const [totalProdutos] = await db.query(
        "SELECT COUNT(*) AS total_produtos, SUM(quantidade) AS total_estoque FROM produtos"
      );

      const [produtosBaixos] = await db.query(
        "SELECT COUNT(*) AS produtos_baixos FROM produtos WHERE quantidade < 10"
      );

      res.status(200).json({
        total_produtos: totalProdutos[0].total_produtos || 0,
        total_estoque: totalProdutos[0].total_estoque || 0,
        produtos_baixos: produtosBaixos[0].produtos_baixos || 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar o relatório de estoque." });
    }
  },

  // Relatório financeiro
  async getFinanceiro(req, res) {
    try {
      const hoje = dayjs().format("YYYY-MM-DD");

      // Faturamento total
      const [totalFaturamento] = await db.query(
        "SELECT SUM(valor) AS total FROM pagamentos"
      );

      // Faturamento diário
      const [faturamentoDiario] = await db.query(
        "SELECT SUM(valor) AS total FROM pagamentos WHERE DATE(data) = ?",
        [hoje]
      );

      // Faturamento mensal
      const [faturamentoMensal] = await db.query(
        "SELECT SUM(valor) AS total FROM pagamentos WHERE MONTH(data) = MONTH(?)",
        [hoje]
      );

      res.status(200).json({
        total_faturamento: totalFaturamento[0].total || 0,
        faturamento_diario: faturamentoDiario[0].total || 0,
        faturamento_mensal: faturamentoMensal[0].total || 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar o relatório financeiro." });
    }
  },

  // Produtos mais vendidos
  async getMaisVendidos(req, res) {
    try {
      const [produtos] = await db.query(
        `SELECT p.nome, SUM(iv.quantidade) AS total_vendido 
         FROM itens_venda iv 
         JOIN produtos p ON iv.produto_id = p.id 
         GROUP BY iv.produto_id 
         ORDER BY total_vendido DESC 
         LIMIT 5`
      );

      res.status(200).json({
        mais_vendidos: produtos,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar o relatório de produtos mais vendidos." });
    }
  },
};

export default relatoriesController;