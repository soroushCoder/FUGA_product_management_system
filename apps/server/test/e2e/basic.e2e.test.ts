import { it, expect, describe } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../src/app.js';

describe('E2E: health + docs', () => {
  const app = buildApp();

  it('GET /health returns ok:true', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /openapi.json exposes the spec with products path', async () => {
    const res = await request(app).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('openapi');
    // We don't assert the whole spec, just that products is present
    expect(res.body).toHaveProperty(['paths','/products']);
  });
});
