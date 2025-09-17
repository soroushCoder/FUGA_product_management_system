import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { execSync } from 'node:child_process';

// Point Prisma at a throwaway Postgres
process.env.UPLOAD_DIR = 'uploads_test';
process.env.PUBLIC_BASE_URL = 'http://localhost:3000';

let container: StartedTestContainer;
let app: any;

async function createPngBuffer() {
  // tiny 1x1 PNG (hard-coded bytes)
  return Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154010d0a2db40000000049454e44ae426082',
    'hex'
  );
}

describe('Products API', () => {
  beforeAll(async () => {
    container = await new GenericContainer('postgres:16')
      .withEnv('POSTGRES_USER', 'postgres')
      .withEnv('POSTGRES_PASSWORD', 'postgres')
      .withEnv('POSTGRES_DB', 'fuga_test')
      .withExposedPorts(5432)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    process.env.DATABASE_URL = `postgresql://postgres:postgres@${host}:${port}/fuga_test?schema=public`;

    // Generate client & push schema
    execSync('npm -w apps/server run prisma:generate', { stdio: 'inherit' });
    execSync('npx -w apps/server prisma db push', { stdio: 'inherit' });

    // import the app after env is set
    const { buildApp } = await import('../src/app.js');
    app = buildApp();
  }, 120_000);

  afterAll(async () => {
    // cleanup uploads dir
    const dir = path.join(process.cwd(), process.env.UPLOAD_DIR!);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    await container.stop();
  });

  it('creates a product via multipart and returns 201', async () => {
    const png = await createPngBuffer();
    const res = await request(app)
      .post('/products')
      .field('name', 'Test Release')
      .field('artistName', 'Test Artist')
      .attach('cover', png, { filename: 'cover.png', contentType: 'image/png' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      name: 'Test Release',
      artistName: 'Test Artist',
      coverUrl: expect.stringContaining('/uploads/')
    });
  });

  it('lists products (newest first)', async () => {
    const res = await request(app).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/products').field('name', 'X').expect(400);
    expect(res.body.message).toMatch(/artistName/);
  });

  it('rejects non-image MIME', async () => {
    const res = await request(app)
      .post('/products')
      .field('name', 'Bad')
      .field('artistName', 'Mime')
      .attach('cover', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('serves openapi.json', async () => {
    const res = await request(app).get('/openapi.json').expect(200);
    expect(res.body.paths['/products']).toBeDefined();
  });
});
