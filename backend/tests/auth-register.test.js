import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import { register } from '../src/controllers/auth.controller.js';

afterEach(() => mock.restoreAll());

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function invoke(body) {
  const findOne = mock.method(User, 'findOne', async () => null);
  const create = mock.method(User, 'create', async (data) => ({ _id: 'user-1', ...data }));
  const hash = mock.method(bcrypt, 'hash', async () => 'hashed-password');
  const res = response();
  let nextError;
  await register({ body }, res, (err) => { nextError = err; });
  assert.equal(nextError, undefined);
  return { res, findOne, create, hash };
}

const valid = { name: 'Test User', email: 'test@example.com', password: 'test-password' };

test('registration without a role defaults to learner', async () => {
  const { res, create } = await invoke(valid);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.role, 'learner');
  assert.equal(create.mock.calls[0].arguments[0].role, 'learner');
});

test('faculty self-registration remains supported', async () => {
  const { res, create } = await invoke({ ...valid, role: 'faculty' });
  assert.equal(res.statusCode, 201);
  assert.equal(create.mock.calls[0].arguments[0].role, 'faculty');
});

test('explicit learner registration remains supported', async () => {
  const { res } = await invoke({ ...valid, role: 'learner' });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.role, 'learner');
});

for (const role of ['admin', 'superadmin', '', null, 42, { name: 'admin' }]) {
  test(`disallowed public role ${JSON.stringify(role)} is rejected before database access`, async () => {
    const { res, findOne, create, hash } = await invoke({ ...valid, role });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Invalid registration role');
    assert.equal(findOne.mock.callCount(), 0);
    assert.equal(create.mock.callCount(), 0);
    assert.equal(hash.mock.callCount(), 0);
  });
}

test('required fields are still validated before database access', async () => {
  const { res, findOne, create } = await invoke({ email: valid.email, password: valid.password, role: 'faculty' });
  assert.equal(res.statusCode, 400);
  assert.equal(findOne.mock.callCount(), 0);
  assert.equal(create.mock.callCount(), 0);
});
