# LMS Frontend (Vite + React + Tailwind)

## Setup

From the project root (`learn-ease-pro-lms`), using Node.js 22.12+:

```sh
cp -n frontend/.env.example frontend/.env
npm --prefix frontend ci
npm run dev
```

Open http://localhost:5173. The example environment points to the backend at
http://localhost:5050/api/v1. Start the backend in a separate terminal using
the [project setup instructions](../README.md#quickstart).

If already inside `frontend`, use `cp -n .env.example .env`, `npm ci`,
and `npm run dev`. All required dependencies, including `@vitejs/plugin-react`,
are declared in `package.json`.

Credentials after seeding (see backend):

- learner@example.com / Secret123!
- faculty@example.com / Secret123!
- admin@example.com / Secret123!
