# LearnEase Pro LMS

MERN for an LMS with:

- Auth (JWT access token), roles (admin/faculty/learner)
- Courses (list/get/create/update)
- Enrollment request/approval
- Feedback posting/listing
- React SPA with protected routes
- Cypress testing

## Quickstart

### 1) Backend

```
cd backend
cp .env.example .env
npm install
npm install mongoose
npm i multer
npm run seed
npm run dev
# API at http://localhost:5050
```

### 2) Frontend

```
cd ../frontend
cp .env.example .env
npm install
npm i -D @vitejs/plugin-react
echo "VITE_API_URL=http://localhost:5050/api/v1" > .env
npm run dev
# App at http://localhost:5173
```

### 3) Cypress (optional)

```
cd ../cypress
npm install
npx cypress open  or  npm run test:e2e
```

Notes:

- Replace secrets in .env before production.
- Add HTTPS, refresh tokens in httpOnly cookies, and external media storage when you scale.
