import { describe, it, expect } from 'vitest';
import { validate, Schemas } from '../../src/middlewares/validate';

function run(mw: any, bodyOrParams: any, source: 'body'|'params'='body') {
  return new Promise((resolve) => {
    const req: any = { [source]: bodyOrParams };
    const res: any = {};
    const next = (err?: any) => resolve(err ?? req[source]);
    mw(req, res, next);
  });
}

describe('validate middleware', () => {
  it('passes valid body', async () => {
    const result: any = await run(validate(Schemas.create), { name: 'A', artistName: 'B' });
    expect(result).toEqual({ name: 'A', artistName: 'B' });
  });
  it('422 on invalid', async () => {
    const err: any = await run(validate(Schemas.create), { name: '' });
    expect(err.status).toBe(422);
    expect(err.details).toBeDefined();
  });
});
