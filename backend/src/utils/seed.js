import dotenv from 'dotenv';
dotenv.config();
import '../config/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

async function run() {
  await User.deleteMany({});
  await Course.deleteMany({});
  await Lesson.deleteMany({});

  const pw = await bcrypt.hash('Secret123!', 10);

  const [admin, faculty, learner] = await User.create([
    { name: 'Alice Admin', email: 'admin@example.com', passwordHash: pw, role: 'admin' },
    { name: 'Frank Faculty', email: 'faculty@example.com', passwordHash: pw, role: 'faculty' },
    { name: 'Lara Learner', email: 'learner@example.com', passwordHash: pw, role: 'learner' },
  ]);

  const [reactCourse, nodeCourse] = await Course.create([
    { title: 'Intro to React', slug: 'intro-to-react', description: 'Basics of React', category: 'Web', level: 'beginner', createdBy: faculty._id, isPublished: true },
    { title: 'Node and Express', slug: 'node-and-express', description: 'Server-side with JS', category: 'Backend', level: 'beginner', createdBy: faculty._id, isPublished: true },
  ]);

  // Add lessons
  await Lesson.create([
    // React
    { course: reactCourse._id, title: 'What is React?', contentType: 'text', order: 1, durationSec: 240, text: 'React fundamentals.' },
    { course: reactCourse._id, title: 'JSX & Components', contentType: 'text', order: 2, durationSec: 420, text: 'JSX, props, state.' },
    { course: reactCourse._id, title: 'Hooks Overview', contentType: 'text', order: 3, durationSec: 480, text: 'useState/useEffect.' },
    // Node
    { course: nodeCourse._id, title: 'Intro to Node', contentType: 'text', order: 1, durationSec: 300, text: 'Runtime and basics.' },
    { course: nodeCourse._id, title: 'Express Fundamentals', contentType: 'text', order: 2, durationSec: 360, text: 'Routing, middleware.' },
    { course: nodeCourse._id, title: 'REST API Patterns', contentType: 'text', order: 3, durationSec: 420, text: 'Controllers & CRUD.' },
  ]);

  console.log('Seeded users:', admin.email, faculty.email, learner.email);
  console.log('Seeded courses:', [reactCourse.title, nodeCourse.title]);
  console.log('Seeded lessons: 3 for each course');

  process.exit(0);
}
run();
