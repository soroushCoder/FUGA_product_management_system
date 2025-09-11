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

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// static uploads
app.use('/uploads', express.static(path.join(process.cwd(), CONFIG.UPLOAD_DIR)));

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// swagger
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.post('/products', upload.single('cover'), create);
app.get('/products', list);
app.get('/products/:id', get);
app.patch('/products/:id', upload.single('cover'), update);
app.delete('/products/:id', remove);

app.listen(CONFIG.PORT, () => {
  console.log(`API listening on http://localhost:${CONFIG.PORT}`);
  console.log(`Docs at http://localhost:${CONFIG.PORT}/api`);
});
