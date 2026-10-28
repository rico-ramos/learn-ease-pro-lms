import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import Lesson from '../src/models/Lesson.js';
import Enrollment from '../src/models/Enrollment.js';
import Progress from '../src/models/Progress.js';
import { mark } from '../src/controllers/progress.controller.js';
import { requireRole } from '../src/middleware/auth.js';

const LEARNER_ID = '507f1f77bcf86cd799439011';
const COURSE_ID = '507f1f77bcf86cd799439012';
const LESSON_ID = '507f1f77bcf86cd799439013';
afterEach(() => mock.restoreAll());

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function invoke({ lesson = { _id: LESSON_ID, course: COURSE_ID }, enrollment = null, body = { lessonId: LESSON_ID, completed: true } } = {}) {
  const lessonSelect = mock.fn(async () => lesson);
  const lessonLookup = mock.method(Lesson, 'findById', () => ({ select: lessonSelect }));
  const enrollmentLookup = mock.method(Enrollment, 'findOne', async () => enrollment);
  const progressSelect = mock.fn(async () => ({ lesson: LESSON_ID, completed: true, secondsWatched: 0 }));
  const progressUpdate = mock.method(Progress, 'findOneAndUpdate', () => ({ select: progressSelect }));
  const req = { body, user: { id: LEARNER_ID, role: 'learner' } };
  const res = response();
  let error;
  await mark(req, res, (err) => { error = err; });
  assert.equal(error, undefined);
  return { res, lessonLookup, enrollmentLookup, progressUpdate };
}

test('approved learner can mark progress on an enrolled course', async () => {
  const { res, enrollmentLookup, progressUpdate } = await invoke({ enrollment: { status: 'approved' } });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(enrollmentLookup.mock.calls[0].arguments[0], {
    learner: LEARNER_ID, course: COURSE_ID, status: 'approved'
  });
  assert.equal(progressUpdate.mock.callCount(), 1);
  assert.deepEqual(progressUpdate.mock.calls[0].arguments[0], {
    learner: LEARNER_ID, course: COURSE_ID, lesson: LESSON_ID
  });
});

test('learner without an approved enrollment is forbidden and progress is not written', async () => {
  const { res, progressUpdate } = await invoke();
  assert.equal(res.statusCode, 403);
  assert.equal(progressUpdate.mock.callCount(), 0);
});

test('pending enrollment cannot be used to mark progress', async () => {
  // The query requires status approved; a pending record is not returned by MongoDB.
  const { res, enrollmentLookup, progressUpdate } = await invoke({ enrollment: null });
  assert.equal(enrollmentLookup.mock.calls[0].arguments[0].status, 'approved');
  assert.equal(res.statusCode, 403);
  assert.equal(progressUpdate.mock.callCount(), 0);
});

test('missing lesson returns 404 before checking enrollment or saving progress', async () => {
  const { res, enrollmentLookup, progressUpdate } = await invoke({ lesson: null });
  assert.equal(res.statusCode, 404);
  assert.equal(enrollmentLookup.mock.callCount(), 0);
  assert.equal(progressUpdate.mock.callCount(), 0);
});

test('missing lessonId returns 400 before any database call', async () => {
  const { res, lessonLookup, enrollmentLookup, progressUpdate } = await invoke({ body: {} });
  assert.equal(res.statusCode, 400);
  assert.equal(lessonLookup.mock.callCount(), 0);
  assert.equal(enrollmentLookup.mock.callCount(), 0);
  assert.equal(progressUpdate.mock.callCount(), 0);
});

test('faculty is rejected by progress marking role middleware', () => {
  const res = response();
  let passed = false;
  requireRole('learner')({ user: { id: LEARNER_ID, role: 'faculty' } }, res, () => { passed = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(passed, false);
});
