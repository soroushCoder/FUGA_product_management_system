import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';

import { CONFIG } from './env.js';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler } from './middlewares/errors.js';

import productsRouter from './modules/products/router.js';

export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.join(process.cwd(), CONFIG.UPLOAD_DIR)));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));

  // 🔌 mount modules
  app.use('/products', productsRouter);       // so endpoints are /products, /products/:id, ...

  // 404 + centralized errors
  app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
  app.use(errorHandler);

  return app;
}
