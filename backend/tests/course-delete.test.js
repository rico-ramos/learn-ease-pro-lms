import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import Course from '../src/models/Course.js';
import { deleteCourse } from '../src/controllers/courses.controller.js';
import { requireRole } from '../src/middleware/auth.js';

const COURSE_ID = '507f1f77bcf86cd799439011';
const OWNER_ID = '507f191e810c19729de860ea';
const OTHER_ID = '507f191e810c19729de860eb';

afterEach(() => mock.restoreAll());

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function course() {
  return { createdBy: { toString: () => OWNER_ID }, deleteOne: mock.fn(async () => ({})) };
}

async function invoke(user, existingCourse) {
  mock.method(Course, 'findById', async () => existingCourse);
  const req = { params: { id: COURSE_ID }, user };
  const res = response();
  let error;
  await deleteCourse(req, res, (err) => { error = err; });
  assert.equal(error, undefined);
  return res;
}

test('course owner can delete their course', async () => {
  const item = course();
  const res = await invoke({ id: OWNER_ID, role: 'faculty' }, item);
  assert.equal(res.statusCode, 200);
  assert.equal(item.deleteOne.mock.callCount(), 1);
});

test('faculty cannot delete another faculty member’s course', async () => {
  const item = course();
  const res = await invoke({ id: OTHER_ID, role: 'faculty' }, item);
  assert.equal(res.statusCode, 403);
  assert.equal(item.deleteOne.mock.callCount(), 0);
});

test('admin can delete any course', async () => {
  const item = course();
  const res = await invoke({ id: OTHER_ID, role: 'admin' }, item);
  assert.equal(res.statusCode, 200);
  assert.equal(item.deleteOne.mock.callCount(), 1);
});

test('missing course returns 404', async () => {
  const res = await invoke({ id: OWNER_ID, role: 'faculty' }, null);
  assert.equal(res.statusCode, 404);
});

test('learner is rejected by role middleware', () => {
  const res = response();
  let passed = false;
  requireRole('faculty', 'admin')({ user: { id: OTHER_ID, role: 'learner' } }, res, () => { passed = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(passed, false);
});
