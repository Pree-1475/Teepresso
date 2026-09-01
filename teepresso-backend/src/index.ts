import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { loadDb } from './config/jsonDb.js';
import authRoutes from './features/auth/routes/authRoutes.js';
import { getCustomersController } from './features/auth/controllers/authController.js';
import orderRoutes from './features/orders/routes/orderRoutes.js';
import productRoutes from './features/products/routes/productRoutes.js';
import inventoryRoutes from './features/inventory/routes/inventoryRoutes.js';
import attendanceRoutes from './features/attendance/routes/attendanceRoutes.js';
import reportsRoutes from './features/reports/routes/reportsRoutes.js';
import categoryRoutes from './features/categories/routes/categoryRoutes.js';
import colorRoutes from './features/categories/routes/colorRoutes.js';
import sizeRoutes from './features/categories/routes/sizeRoutes.js';
import patternRoutes from './features/categories/routes/patternRoutes.js';
import settingsRoutes from './features/settings/routes/settingsRoutes.js';

// Load local JSON DB
loadDb();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Teepresso Modular Backend API' });
});

// Register Feature Routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.get(`${config.apiPrefix}/customers`, getCustomersController);
app.use(`${config.apiPrefix}/orders`, orderRoutes);
app.use(`${config.apiPrefix}/products`, productRoutes);
app.use(`${config.apiPrefix}/inventory`, inventoryRoutes);
app.use(`${config.apiPrefix}/attendance`, attendanceRoutes);
app.use(`${config.apiPrefix}/reports`, reportsRoutes);
app.use(`${config.apiPrefix}/categories`, categoryRoutes);
app.use(`${config.apiPrefix}/colors`, colorRoutes);
app.use(`${config.apiPrefix}/sizes`, sizeRoutes);
app.use(`${config.apiPrefix}/patterns`, patternRoutes);
app.use(`${config.apiPrefix}/settings`, settingsRoutes);

app.listen(config.port, () => {
  console.log(`🚀 Teepresso Backend API listening on port ${config.port}`);
});

