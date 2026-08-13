import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './features/auth/routes/authRoutes.js';
import orderRoutes from './features/orders/routes/orderRoutes.js';
import productRoutes from './features/products/routes/productRoutes.js';
import inventoryRoutes from './features/inventory/routes/inventoryRoutes.js';
import attendanceRoutes from './features/attendance/routes/attendanceRoutes.js';
import reportsRoutes from './features/reports/routes/reportsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Teepresso Modular Backend API' });
});

// Register Feature Routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/orders`, orderRoutes);
app.use(`${config.apiPrefix}/products`, productRoutes);
app.use(`${config.apiPrefix}/inventory`, inventoryRoutes);
app.use(`${config.apiPrefix}/attendance`, attendanceRoutes);
app.use(`${config.apiPrefix}/reports`, reportsRoutes);

app.listen(config.port, () => {
  console.log(`🚀 Teepresso Backend API listening on port ${config.port}`);
});

