import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth/authRoutes.js';
import salesRoutes from './routes/sales/salesRoutes.js';
import userRoutes from './routes/user/userRoutes.js';
import productRoutes from './routes/products/productRoutes.js';
import paymentRoutes from './routes/payment/paymentRoutes.js';
import stockRoutes from './routes/stock/stockRoutes.js';
import relatoryRoutes from './routes/relatories/relatoryRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
    return res.send({ Hello: "World!" });
})

// Rotas.

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/relatories', relatoryRoutes)

// Resto do servidoor.

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await app.listen(PORT, () => {
            console.log("\n🛒CaixaFácil API Rodando em http://localhost:" + PORT + "/");
        })
    }
    catch (err) {
        console.error("Erro ao iniciar o servidor: " + err);
    }
}

start();