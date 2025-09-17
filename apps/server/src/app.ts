// apps/server/src/app.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { upload } from './upload.js';
import { list, get, create, update, remove } from './products.js';
import { CONFIG } from './env.js';
import { swaggerSpec } from './swagger.js';

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/uploads', express.static(path.join(process.cwd(), CONFIG.UPLOAD_DIR)));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));
  app.post('/products', upload.single('cover'), create);
  app.get('/products', list);
  app.get('/products/:id', get);
  app.patch('/products/:id', upload.single('cover'), update);
  app.delete('/products/:id', remove);
  return app;
}
