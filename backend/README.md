# LMS Backend

## Setup

```
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

## Endpoints (base: /api/v1)

- POST /auth/register
- POST /auth/login
- GET /auth/me (Bearer token)
- GET /courses
- GET /courses/:slug
- POST /courses (faculty/admin)
- PATCH /courses/:slug (faculty owner/admin)
- POST /enrollments/request (learner)
- GET /enrollments/mine (auth)
- PATCH /enrollments/:id/approve (admin/faculty)
- GET /feedback/course/:courseId
- POST /feedback/course/:courseId (learner)
