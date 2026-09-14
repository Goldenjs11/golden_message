import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../backend/src/server.js';

test('GET /health exposes application metadata and a valid service status payload', async () => {
  const response = await request(app).get('/health');

  assert.ok([200, 503].includes(response.statusCode));
  assert.equal(response.body.service, 'golden-message');
  assert.equal(typeof response.body.uptime, 'number');
  assert.ok(response.body.timestamp || response.body.timestamp === '');
});

test('POST /api/register rejects missing field validation before touching the database', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'bad-email', user: 'ab', password: '123' });

  assert.equal(response.statusCode, 400);
  assert.match(response.text, /email|user|password/i);
});

test('POST /api/login rejects malformed credentials before authentication', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ username: 'ab', password: '123' });

  assert.equal(response.statusCode, 400);
  assert.match(response.text, /username|password/i);
});
