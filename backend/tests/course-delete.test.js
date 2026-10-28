import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';
import Enrollment from '../src/models/Enrollment.js';
import Feedback from '../src/models/Feedback.js';
import Progress from '../src/models/Progress.js';
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
  return { _id: COURSE_ID, createdBy: { toString: () => OWNER_ID }, deleteOne: mock.fn(async () => ({})) };
}

async function invoke(user, existingCourse) {
  mock.method(Course, 'findById', async () => existingCourse);
  for (const model of [Progress, Feedback, Enrollment, Lesson]) {
    mock.method(model, 'deleteMany', async () => ({ deletedCount: 1 }));
  }
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


test('deleting a course cleans up dependent collections using its course id', async () => {
  const item = course();
  const res = await invoke({ id: OWNER_ID, role: 'faculty' }, item);
  assert.equal(res.statusCode, 200);
  for (const model of [Progress, Feedback, Enrollment, Lesson]) {
    assert.equal(model.deleteMany.mock.callCount(), 1);
    assert.deepEqual(model.deleteMany.mock.calls[0].arguments, [{ course: COURSE_ID }]);
  }
  assert.equal(item.deleteOne.mock.callCount(), 1);
});

test('unauthorized faculty cannot delete course or dependent records', async () => {
  const item = course();
  const res = await invoke({ id: OTHER_ID, role: 'faculty' }, item);
  assert.equal(res.statusCode, 403);
  for (const model of [Progress, Feedback, Enrollment, Lesson]) {
    assert.equal(model.deleteMany.mock.callCount(), 0);
  }
  assert.equal(item.deleteOne.mock.callCount(), 0);
});

test('missing course does not delete dependent records', async () => {
  const res = await invoke({ id: OWNER_ID, role: 'faculty' }, null);
  assert.equal(res.statusCode, 404);
  for (const model of [Progress, Feedback, Enrollment, Lesson]) {
    assert.equal(model.deleteMany.mock.callCount(), 0);
  }
});

test('cleanup failure is passed to error handler and parent course remains', async () => {
  const item = course();
  const failure = new Error('cleanup failed');
  mock.method(Course, 'findById', async () => item);
  mock.method(Progress, 'deleteMany', async () => { throw failure; });
  const req = { params: { id: COURSE_ID }, user: { id: OWNER_ID, role: 'faculty' } };
  const res = response();
  let caught;
  await deleteCourse(req, res, err => { caught = err; });
  assert.equal(caught, failure);
  assert.equal(item.deleteOne.mock.callCount(), 0);
});
