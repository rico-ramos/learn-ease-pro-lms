import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import Course from '../src/models/Course.js';
import Enrollment from '../src/models/Enrollment.js';
import { approve } from '../src/controllers/enrollments.controller.js';
import { requireRole } from '../src/middleware/auth.js';

const ENROLLMENT_ID = '507f1f77bcf86cd799439011';
const COURSE_ID = '507f1f77bcf86cd799439012';
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

function enrollment() {
  return {
    course: COURSE_ID,
    status: 'requested',
    approvedBy: undefined,
    save: mock.fn(async () => ({}))
  };
}

async function invoke(user, existingEnrollment, existingCourse) {
  mock.method(Enrollment, 'findById', async () => existingEnrollment);
  const courseLookup = mock.method(Course, 'findById', async () => existingCourse);
  const req = { params: { id: ENROLLMENT_ID }, user };
  const res = response();
  let error;
  await approve(req, res, (err) => { error = err; });
  assert.equal(error, undefined);
  return { res, courseLookup };
}

test('course owner can approve an enrollment', async () => {
  const item = enrollment();
  const { res } = await invoke({ id: OWNER_ID, role: 'faculty' }, item, { createdBy: OWNER_ID });
  assert.equal(res.statusCode, 200);
  assert.equal(item.status, 'approved');
  assert.equal(item.approvedBy, OWNER_ID);
  assert.equal(item.save.mock.callCount(), 1);
});

test('unrelated faculty cannot approve another faculty member’s enrollment', async () => {
  const item = enrollment();
  const { res } = await invoke({ id: OTHER_ID, role: 'faculty' }, item, { createdBy: OWNER_ID });
  assert.equal(res.statusCode, 403);
  assert.equal(item.status, 'requested');
  assert.equal(item.approvedBy, undefined);
  assert.equal(item.save.mock.callCount(), 0);
});

test('admin can approve an enrollment from any course', async () => {
  const item = enrollment();
  const { res } = await invoke({ id: OTHER_ID, role: 'admin' }, item, { createdBy: OWNER_ID });
  assert.equal(res.statusCode, 200);
  assert.equal(item.save.mock.callCount(), 1);
});

test('missing enrollment returns 404 without looking up course', async () => {
  const { res, courseLookup } = await invoke({ id: OWNER_ID, role: 'faculty' }, null, null);
  assert.equal(res.statusCode, 404);
  assert.equal(courseLookup.mock.callCount(), 0);
});

test('missing course returns 404 without saving enrollment', async () => {
  const item = enrollment();
  const { res } = await invoke({ id: OWNER_ID, role: 'faculty' }, item, null);
  assert.equal(res.statusCode, 404);
  assert.equal(item.save.mock.callCount(), 0);
});

test('learner is rejected by approval role middleware', () => {
  const res = response();
  let passed = false;
  requireRole('admin', 'faculty')({ user: { id: OTHER_ID, role: 'learner' } }, res, () => { passed = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(passed, false);
});
