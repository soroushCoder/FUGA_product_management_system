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
import { errorHandler } from './errors.js';


import { validate, Schemas } from './validate.js';

export function buildApp() {
  const app = express();

  // global middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // static uploads
  app.use('/uploads', express.static(path.join(process.cwd(), CONFIG.UPLOAD_DIR)));

  // health + docs
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));

  // routes (order matters for multipart)
  app.post(
    '/products',
    upload.single('cover'),         // parse multipart first so req.body is available
    validate(Schemas.create),       // validates name & artistName (zod)
    create
  );

  app.get('/products', list);

  app.get(
    '/products/:id',
    validate(Schemas.id, 'params'), // coerce/validate :id -> number
    get
  );

  app.patch(
    '/products/:id',
    upload.single('cover'),
    validate(Schemas.id, 'params'),
    validate(Schemas.update),       // optional name/artistName
    update
  );

  app.delete(
    '/products/:id',
    validate(Schemas.id, 'params'),
    remove
  );

  // 404 + centralized errors (keep last)
  app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
  app.use(errorHandler);

  return app;
}
