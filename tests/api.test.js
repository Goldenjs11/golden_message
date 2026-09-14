import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import { app } from '../backend/src/server.js';
import { uploadRoot, publicUploadBase } from '../backend/src/config/uploads.js';
import { serializeUserPublic } from '../backend/src/utils/serializeUserPublic.js';

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

test('GET /api/message/not-found/reactions stays public and does not force auth', async () => {
  const response = await request(app).get('/api/message/not-found/reactions');

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, 'Mensaje no encontrado');
});

test('POST /api/messages returns 401 for missing session and 401 for an invalid JWT cookie', async () => {
  const noSession = await request(app)
    .post('/api/messages')
    .send({ idUsuario: 1 });

  const badSession = await request(app)
    .post('/api/messages')
    .set('Cookie', ['jwt=not-a-real-token'])
    .send({ idUsuario: 1 });

  assert.equal(noSession.statusCode, 401);
  assert.equal(noSession.body.status, 'Error');
  assert.equal(noSession.body.message, 'No autorizado. Debes iniciar sesión.');

  assert.equal(badSession.statusCode, 401);
  assert.equal(badSession.body.status, 'Error');
  assert.equal(badSession.body.message, 'No autorizado. Debes iniciar sesión.');
});

test('package manifest exposes a lint script and ESLint dev dependency', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

  assert.equal(pkg.scripts.lint, 'eslint backend/src/**/*.js tests/**/*.js');
  assert.equal(pkg.devDependencies.eslint, '^9.39.5');
});

test('upload directory and public upload base are resolved from configuration instead of a relative router folder', () => {
  assert.ok(uploadRoot.length > 0);
  assert.equal(publicUploadBase, '/uploads');
});

test('serializeUserPublic strips sensitive fields from the authentication payload contract', () => {
  const profile = serializeUserPublic({
    id: 3,
    username: 'nemo',
    email: 'nemo@example.com',
    password_hash: 'secret-hash',
    id_role: 2,
    verificado: false,
    token_verificacion: 'abc',
    telefono: '1234'
  });

  assert.equal(profile.id, 3);
  assert.equal(profile.username, 'nemo');
  assert.equal(profile.email, 'nemo@example.com');
  assert.equal(profile.telefono, '1234');
  assert.equal(profile.password_hash, undefined);
  assert.equal(profile.id_role, undefined);
  assert.equal(profile.verificado, undefined);
  assert.equal(profile.token_verificacion, undefined);
});
