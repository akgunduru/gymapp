# Social Gym System

Social Gym System is a web-only graduation MVP for gym discovery, gym buddy matching, workout recommendations, nutrition tracking, professional verification, consultations, messaging, and admin workflows.

The original Vite demo has been moved to `prototype-vite/` and is kept only as a prototype/reference. The root project is now the production Next.js foundation.

## Current Phase

Phase 3: Authentication and role-based access control.

The completed foundation includes:

- Next.js 15 with TypeScript and App Router.
- Tailwind CSS.
- shadcn/ui-ready structure.
- Placeholder routes for the planned modules.
- Basic homepage, dashboard placeholder, navbar, and sidebar.
- Local upload folders for future meal images and certificates.

Phase 2 adds:

- PostgreSQL Prisma schema with UUID primary keys.
- Domain enums for roles, fitness goals, matching, professionals, consultations, meals, and mock AI analysis.
- Relations for users, profiles, locations, gyms, workouts, buddy matching, nutrition, professionals, consultations, messages, and admin actions.
- Useful indexes for user ids, roles, statuses, city, district, and creation dates.
- Seed data for demo users, gyms, exercises, workout plans, professional profiles, certificates, consultations, messages, and nutrition logs.

Phase 3 adds:

- Credentials login and registration.
- Bcrypt password verification.
- Signed HTTP-only session cookie.
- Protected application routes.
- Admin-only route guard for `/admin`.
- Role-aware navigation.

Business modules are intentionally not implemented yet.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` to point to your PostgreSQL database.

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.
If the in-app browser has trouble with `127.0.0.1`, open `http://localhost:3000` instead.
The dev script clears `.next` before starting so stale build assets do not break CSS during local development.

## Database Setup

The application uses PostgreSQL with Prisma ORM. Make sure PostgreSQL is running and create a database named `social_gym_system`, or update `DATABASE_URL` in `.env` to match your local database.

For this local workspace, a project-specific PostgreSQL data directory can be used on port `5433` so it does not conflict with any system PostgreSQL install:

```bash
mkdir -p .local-postgres
initdb -D .local-postgres --auth=trust --encoding=UTF8 --locale=C
pg_ctl -D .local-postgres -o "-p 5433" -l .local-postgres/server.log start
createuser -h localhost -p 5433 -s postgres
psql -h localhost -p 5433 -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
createdb -h localhost -p 5433 -U postgres social_gym_system
```

Use this connection string for the project-specific local database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/social_gym_system?schema=public"
```

Run these commands from the project root:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Seeded demo accounts all use this password:

```txt
DemoPass123!
```

Seeded account emails:

```txt
admin@socialgym.test
ece.user@socialgym.test
bora.user@socialgym.test
derya.user@socialgym.test
mert.trainer@socialgym.test
sena.trainer@socialgym.test
irmak.dietitian@socialgym.test
arda.dietitian@socialgym.test
```

Passwords are stored as bcrypt hashes in `User.passwordHash`. The login form can use any seeded account with the demo password above.

## Useful Scripts

```bash
npm run dev
npm run clean
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

## Documentation

Planning documents live under `/docs`:

- Product analysis
- MVP scope
- System architecture
- Database schema
- API specification
- UI screen flow
- Task breakdown
- Implementation roadmap

## Prototype

The previous Vite demo is preserved under:

```txt
prototype-vite/
```

It should not be mixed with the production Next.js app. Reuse only its product ideas and mock data when implementing later phases.
