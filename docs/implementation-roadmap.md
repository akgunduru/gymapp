# Implementation Roadmap

## Phase 0: Documentation

Status: current phase.

Goals:

- Document product scope.
- Document architecture.
- Document database, API, UI flow, tasks, and roadmap.
- Identify how current Vite demo maps to the target application.

Exit criteria:

- All `/docs` files exist.
- No application code is changed.

## Phase 1: Next.js Foundation

Goals:

- Introduce Next.js 15 App Router.
- Configure Tailwind CSS and shadcn/ui.
- Create route groups for auth and protected app screens.
- Create base layout and navigation.

Suggested screens:

- `/login`
- `/register`
- `/dashboard`

Exit criteria:

- `npm run dev` starts Next.js.
- App shell is visible.
- No database dependency required yet, unless Prisma is added in the same phase.

## Phase 2: Database and Seed Data

Goals:

- Add Prisma and PostgreSQL.
- Implement schema from database documentation.
- Create initial migration.
- Add seed data.

Exit criteria:

- Database can be migrated.
- Seed creates demo users and domain data.
- Prisma client can query seeded gyms and exercises.

## Phase 3: Auth and RBAC

Goals:

- Implement credentials auth.
- Add password hashing.
- Add session and route protection.
- Add role helpers.

Exit criteria:

- Demo accounts for USER, TRAINER, DIETITIAN, ADMIN can log in.
- Unauthorized users are redirected or blocked.
- Admin route is not visible or accessible to non-admin users.

## Phase 4: Profile and Preferences

Goals:

- Build profile screen.
- Persist fitness level, goals, location, muscle preferences, and nutrition goals.
- Use Zod validation.

Exit criteria:

- Profile survives refresh.
- Preferences are available to matching, workouts, and nutrition modules.

## Phase 5: Gym Discovery

Goals:

- Build gym list and detail.
- Render Leaflet/OpenStreetMap markers.
- Display associated trainers.

Exit criteria:

- Seeded gyms are visible on map and list.
- User can inspect gym details.

## Phase 6: Buddy Matching

Goals:

- Build matching service.
- Add ranked buddy list.
- Add filters.
- Add direct conversation creation.

Exit criteria:

- Matching uses persisted user profiles.
- User can start a message thread from a buddy card.

## Phase 7: Workout Recommendation

Goals:

- Build exercise and workout template queries.
- Filter by muscle group and level.
- Use profile defaults.

Exit criteria:

- User can generate a simple workout recommendation from database seed data.

## Phase 8: Nutrition and Mock AI

Goals:

- Build daily nutrition dashboard.
- Add manual meal entry.
- Add local meal image upload.
- Add mock analyzer module.
- Store calories and macros.

Exit criteria:

- User can upload image, receive mock result, edit/confirm if implemented, and save meal entry.
- Daily totals update.

## Phase 9: Professionals and Verification

Goals:

- Build trainer and dietitian profile edit pages.
- Add certificate upload.
- Build public professional listing.
- Build admin verification queue.

Exit criteria:

- Professional can submit certificate.
- Admin can approve/reject.
- Approved professionals appear in public listing.

## Phase 10: Consultations and Messaging

Goals:

- Build consultation request flow.
- Build status changes.
- Build conversation list and thread.
- Add send message action.

Exit criteria:

- User can request consultation.
- Professional can accept/reject.
- Participants can exchange persistent messages.

## Phase 11: Admin Panel Completion

Goals:

- Add admin dashboard metrics.
- Add user management list.
- Add basic visibility over platform data.

Exit criteria:

- Admin has a coherent control panel.
- Admin-only server actions reject non-admin users.

## Phase 12: Polish and Verification

Goals:

- Review responsive UI.
- Add loading and empty states.
- Run lint/build.
- Add basic tests for pure services.
- Verify all role demo flows.

Exit criteria:

- Build passes.
- Manual test checklist passes.
- Documentation is updated if implementation decisions changed.

## Recommended MVP Milestones

| Milestone | Included phases | Expected result |
| --- | --- | --- |
| M1 Foundation | 1-3 | Next.js app with database auth and roles |
| M2 User Core | 4-7 | Profile, gyms, buddies, workouts |
| M3 Nutrition | 8 | Meal tracking and mock AI upload |
| M4 Professional Flow | 9-10 | Verification, consultations, messaging |
| M5 Admin and Polish | 11-12 | Complete demo-ready graduation MVP |

## Migration Note From Current App

The current Vite app should be treated as a prototype, not the final architecture. Reuse its mock data and product ideas, but implement the target system module by module in Next.js.

Recommended reuse:

- Move gym, trainer, dietitian, exercise, and calorie examples into Prisma seed data.
- Reuse the calorie mock heuristic inside `server/mock-ai/meal-analyzer.ts`.
- Recreate UI screens with shadcn/ui and feature modules instead of copying the single large `App.tsx`.

## Final Definition of Done

The project can be considered MVP-complete when:

- All required roles exist and are enforced server-side.
- All listed product modules have database-backed flows.
- File upload works locally for meals and certificates.
- Mock AI meal analysis is isolated and replaceable.
- Admin verification is functional.
- Seed data lets a reviewer demo the entire system without manual setup.
- The app builds successfully.

