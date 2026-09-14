import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, validateLogin } from '../backend/src/validators/validators.js';
import { esAdmin } from '../backend/src/middlewares/authorization.js';

test('validateRegistration rejects payload without email, username and password', () => {
  const result = validateRegistration({});
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 1);
});

test('validateLogin rejects payload without username or password', () => {
  const result = validateLogin({ username: 'alex' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 1);
});

test('esAdmin returns true only when the user role matches the configured administrator role', () => {
  assert.equal(esAdmin({ id_role: 1 }), true);
  assert.equal(esAdmin({ id_role: 2 }), false);
});
