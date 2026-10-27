# LearnEase Pro LMS

MERN for an LMS with:

- Auth (JWT access token), roles (admin/faculty/learner)
- Courses (list/get/create/update)
- Enrollment request/approval
- Feedback posting/listing
- React SPA with protected routes
- Cypress testing

## Quickstart

Prerequisites: Git, Node.js 22.12+ with npm, and a running MongoDB database.
Check Node with `node --version`.

Clone the repository and enter the project root:

```sh
git clone https://github.com/rico-ramos/learn-ease-pro-lms.git
cd learn-ease-pro-lms
```

If you already have this checkout, open a terminal in `learn-ease-pro-lms`.

The default database is `mongodb://localhost:27017/learn-ease-pro`. If you
have Docker installed, you can start a local MongoDB instance with:

```sh
docker run --name learn-ease-mongo -d -p 127.0.0.1:27017:27017 mongo:7
```

On later runs, use `docker start learn-ease-mongo`. Alternatively, use your
existing local MongoDB service or set `MONGODB_URI` in `backend/.env` to a
MongoDB Atlas connection string with database credentials and network access.

Run each section below from the project root (`learn-ease-pro-lms`) in a
separate terminal. Keep both the backend and frontend running.

### 1) Backend

```sh
cp -n backend/.env.example backend/.env
npm --prefix backend ci
```

Check `backend/.env` and set `MONGODB_URI` if you are using a different database.
Use a dedicated demo database: seeding deletes existing users, courses, and
lessons in the configured database, then creates sample data.

```sh
npm --prefix backend run seed
npm --prefix backend run dev
# API at http://localhost:5050
```

### 2) Frontend

Open a new terminal at the project root:

```sh
cp -n frontend/.env.example frontend/.env
npm --prefix frontend ci
npm run dev
# App at http://localhost:5173
```

The example frontend environment already sets
`VITE_API_URL=http://localhost:5050/api/v1`. The `cp -n` commands preserve any
existing environment files. React's Vite plugin and the backend dependencies
are declared in their respective `package.json` files; no extra installs are needed.

From the project root, `npm run dev` starts the frontend and `npm run build`
builds it for production. If your terminal is already inside `frontend`, run
`npm ci` and `npm run dev` directly.

### 3) Try the demo

Open http://localhost:5173 and sign in with one of the seeded accounts:

| Role | Email | Password |
| --- | --- | --- |
| Learner | learner@example.com | Secret123! |
| Faculty | faculty@example.com | Secret123! |
| Admin | admin@example.com | Secret123! |

Browse the sample courses as a learner, or use the faculty dashboard to manage
courses. To check the API, open http://localhost:5050/api/v1/health; it should
return JSON with `"status":"ok"`.

For later sessions, start MongoDB and run the backend and frontend dev commands
in separate terminals. Dependency installation and seeding are setup steps;
you do not need to repeat them for each session.

### Troubleshooting

If you see `cd: no such file or directory: ../frontend`, you are likely already
at the project root. Use the commands above; `../frontend` only works from
inside `backend`. A failed `cd` leaves the terminal in its original directory,
so subsequent commands can install dependencies or write `.env` in the wrong place.
The frontend reads `frontend/.env`, not the root `.env`.

If the backend reports a MongoDB connection error, check that MongoDB is running
and that `MONGODB_URI` points to it. Login requires both the backend and seeded
users; opening the frontend alone does not provide demo data.

Use port 5173 for the frontend and 5050 for the backend. If either is occupied,
stop the previous instance. Vite may select another port automatically, which
will not match the default backend `CORS_ORIGIN`. If you intentionally change
ports, update `backend/.env` (`PORT`, `CORS_ORIGIN`) and `frontend/.env`
(`VITE_API_URL`) to match, then restart both servers.

### Cypress (optional)

In another terminal at the project root, with the app and API running:

```sh
npm ci
npm run test:e2e:open
# Or run tests without the interactive runner:
npm run test:e2e
```

Notes:

- Replace secrets in .env before production.
- Add HTTPS, refresh tokens in httpOnly cookies, and external media storage when you scale.
