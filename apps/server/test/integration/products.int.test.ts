import { it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { buildApp } from '../../src/app.js';
import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

const tinyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
    'base64'
);

let pg: StartedPostgreSqlContainer;
let app: ReturnType<typeof buildApp>;

beforeAll(async () => {
    pg = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('fuga_test')
        .withUsername('postgres')
        .withPassword('postgres')
        .start();

    // Build DATABASE_URL (works across versions)
    const url = `postgresql://${pg.getUsername()}:${pg.getPassword()}@${pg.getHost()}:${pg.getPort()}/${pg.getDatabase()}`;
    process.env.DATABASE_URL = url;

    execSync('npm run prisma:generate', { stdio: 'inherit' });
    execSync('npm run prisma:dbpush', { stdio: 'inherit' });

    app = buildApp();
}, 120_000);

afterAll(async () => {
    await pg.stop();
});

it('creates a product (multipart) and returns 201', async () => {
    const res = await request(app)
        .post('/products')
        .field('name', 'Arcane: OST')
        .field('artistName', 'Riot Games Music')
        .attach('cover', tinyPng, { filename: 'cover.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Arcane: OST');
    expect(res.body.coverUrl).toMatch(/\/uploads\//);
});

it('lists products (newest first)', async () => {
    // create a second one to ensure order
    await request(app)
        .post('/products')
        .field('name', 'Second Release')
        .field('artistName', 'Various Artists')
        .attach('cover', tinyPng, { filename: 'c2.png', contentType: 'image/png' });

    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // newest first -> first item should be "Second Release"
    expect(res.body[0].name).toBe('Second Release');
});

it('fails create when cover missing (400)', async () => {
    const res = await request(app)
        .post('/products')
        .field('name', 'No Cover')
        .field('artistName', 'X');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cover is required/i);
});

it('fails create when missing name (422 via zod)', async () => {
    const res = await request(app)
        .post('/products')
        .field('artistName', 'X')
        .attach('cover', tinyPng, { filename: 'c.png', contentType: 'image/png' });
    expect(res.status).toBe(422);
});

it('rejects non-image MIME (400)', async () => {
    const res = await request(app)
        .post('/products')
        .field('name', 'Bad File')
        .field('artistName', 'X')
        .attach('cover', Buffer.from('not an image'), { filename: 'bad.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
});

it('404s on get/update/delete unknown id', async () => {
    const getRes = await request(app).get('/products/999999');
    expect(getRes.status).toBe(404);

    const patchRes = await request(app)
        .patch('/products/999999')
        .field('name', 'Nope');
    expect(patchRes.status).toBe(404);

    const delRes = await request(app).delete('/products/999999');
    expect(delRes.status).toBe(404);
});

