import assert from 'node:assert/strict';
import { test, afterEach, mock } from 'node:test';
import jwt from 'jsonwebtoken';
import Course from '../src/models/Course.js';
import { list, getOne } from '../src/controllers/courses.controller.js';
import { optionalAuth } from '../src/middleware/auth.js';

const OWNER = '507f191e810c19729de860ea';
const OTHER = '507f191e810c19729de860eb';
afterEach(() => mock.restoreAll());
function response() {
  return {
    statusCode: 200, body: undefined,
    status(n) { this.statusCode = n; return this; },
    json(body) { this.body = body; return this; }
  };
}
function course(isPublished) {
  return { isPublished, createdBy: { _id: { toString: () => OWNER } }, title: 'Test course' };
}
async function detail(item, user) {
  mock.method(Course, 'findOne', () => ({ populate: async () => item }));
  const res = response(); let error;
  await getOne({ params: { slug: 'test-course' }, user }, res, e => { error = e; });
  assert.equal(error, undefined);
  return res;
}
test('public course list always filters to published courses', async () => {
  let filter;
  mock.method(Course, 'find', f => {
    filter = f;
    return { select: () => ({ limit: async () => [] }) };
  });
  const res = response();
  await list({ query: {} }, res, e => { throw e; });
  assert.deepEqual(filter, { isPublished: true });
  assert.equal(res.statusCode, 200);
});
test('search list also enforces published filter', async () => {
  let filter;
  mock.method(Course, 'find', f => { filter = f; return { select: () => ({ limit: async () => [] }) }; });
  await list({ query: { q: 'react' } }, response(), e => { throw e; });
  assert.equal(filter.isPublished, true);
  assert.equal(filter.title.test('React Basics'), true);
});
test('published course details remain public', async () => {
  const res = await detail(course(true), undefined);
  assert.equal(res.statusCode, 200);
});
test('anonymous user cannot read draft details', async () => {
  const res = await detail(course(false), undefined);
  assert.equal(res.statusCode, 404);
});
test('learner cannot read draft details', async () => {
  const res = await detail(course(false), { id: OTHER, role: 'learner' });
  assert.equal(res.statusCode, 404);
});
test('unrelated faculty cannot read draft details', async () => {
  const res = await detail(course(false), { id: OTHER, role: 'faculty' });
  assert.equal(res.statusCode, 404);
});
test('course owner can read their draft', async () => {
  const res = await detail(course(false), { id: OWNER, role: 'faculty' });
  assert.equal(res.statusCode, 200);
});
test('administrator can read draft details', async () => {
  const res = await detail(course(false), { id: OTHER, role: 'admin' });
  assert.equal(res.statusCode, 200);
});
test('missing course returns 404', async () => {
  const res = await detail(null, undefined);
  assert.equal(res.statusCode, 404);
});
test('optional authentication permits anonymous requests', () => {
  const req = { headers: {} }, res = response(); let next = false;
  optionalAuth(req, res, () => { next = true; });
  assert.equal(next, true);
});
test('optional authentication rejects malformed Authorization headers', () => {
  const req = { headers: { authorization: 'Basic abc' } }, res = response(); let next = false;
  optionalAuth(req, res, () => { next = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(next, false);
});
test('optional authentication reads verified JWT identity', () => {
  mock.method(jwt, 'verify', () => ({ sub: OWNER, role: 'faculty' }));
  const req = { headers: { authorization: 'Bearer token' } }, res = response(); let next = false;
  optionalAuth(req, res, () => { next = true; });
  assert.equal(next, true);
  assert.deepEqual(req.user, { id: OWNER, role: 'faculty' });
});
test('optional authentication rejects invalid tokens', () => {
  mock.method(jwt, 'verify', () => { throw new Error('bad token'); });
  const req = { headers: { authorization: 'Bearer bad' } }, res = response(); let next = false;
  optionalAuth(req, res, () => { next = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(next, false);
});
