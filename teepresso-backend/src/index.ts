import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initNeonDatabase } from './config/db.js';
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

const app = express();

// Explicit Permissive CORS Configuration for Vercel & Production Frontends
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Health Check Endpoint (Responds INSTANTLY for Cloud Run Health Probes)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Teepresso Modular Backend API', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Teepresso Modular Backend API Root', timestamp: new Date().toISOString() });
});

// 2. Register Feature Routes
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

// 3. Start Server IMMEDIATELY on process.env.PORT
const server = app.listen(config.port, () => {
  console.log(`🚀 Teepresso Backend API listening on port ${config.port}`);
  
  // Asynchronously initialize database in background so port binding is instant!
  setTimeout(() => {
    initNeonDatabase().catch(err => console.error('Background DB initialization error:', err));
  }, 100);
});
