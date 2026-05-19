# Task Breakdown

## Working Rule

Do not build everything at once. Each module should be implemented and verified before moving to the next dependent module.

Recommended order:

1. Project foundation.
2. Database and auth.
3. Profile and RBAC.
4. Feature modules.
5. Admin and verification.
6. Polish and seed/demo flows.

## Epic 1: Project Foundation

- Create Next.js 15 App Router project structure inside the existing repository or migrate cleanly from the current Vite app.
- Add TypeScript, Tailwind CSS, shadcn/ui.
- Configure ESLint/formatting.
- Add base app shell and protected route layout.
- Add shared UI primitives and layout components.
- Add environment variable example file.

Deliverable:

- App boots with Next.js.
- Shared layout renders.
- No feature logic yet.

## Epic 2: Prisma and PostgreSQL

- Install Prisma and PostgreSQL client.
- Create Prisma schema from `docs/database-schema.md`.
- Configure `DATABASE_URL`.
- Create initial migration.
- Add Prisma singleton client.
- Add seed script.
- Seed users, gyms, exercises, workouts, professionals, and example messages.

Deliverable:

- `prisma migrate dev` works.
- `prisma db seed` creates demo data.

## Epic 3: Authentication

- Implement credentials registration.
- Implement login/logout.
- Hash passwords.
- Store user role in session.
- Add route guards.
- Add server-side auth helpers.

Deliverable:

- Demo users can log in.
- Protected pages require authentication.

## Epic 4: RBAC and Profile

- Implement `requireUser`, `requireRole`, `requireAnyRole`, and ownership helpers.
- Build profile page.
- Add profile update validation with Zod.
- Persist location, goals, muscle groups, level, and nutrition goals.

Deliverable:

- User profile data persists.
- Unauthorized updates are blocked server-side.

## Epic 5: Gym Discovery

- Build gym list page.
- Add Leaflet map component.
- Render gym markers from database.
- Add gym detail card.
- Link trainers associated with gyms.

Deliverable:

- Authenticated users can discover seeded gyms on a map.

## Epic 6: Buddy Matching

- Implement Haversine distance helper.
- Build matching service.
- Rank users by distance, shared muscle groups, shared goals, and level.
- Build buddy cards and filters.
- Add action to start direct conversation.

Deliverable:

- Users can view ranked buddy matches and start a conversation.

## Epic 7: Workout Recommendation

- Build workout recommendation service.
- Add filters by muscle group and level.
- Show exercises and workout templates.
- Use profile preferences as defaults.

Deliverable:

- Users get database-backed workout recommendations.

## Epic 8: Nutrition and Mock AI

- Build nutrition dashboard.
- Add manual meal entry.
- Add daily totals for calories and macros.
- Implement local meal image upload.
- Implement isolated mock AI analyzer.
- Store MealEntry and MealAnalysis.

Deliverable:

- Users can upload meal images and save mock AI nutrition results.

## Epic 9: Professional Profiles

- Build trainer profile edit screen.
- Build dietitian profile edit screen.
- Add certificate upload.
- Set verification status to PENDING after certificate upload.
- Build public professional listing.

Deliverable:

- Professionals can submit verification data.
- Users can browse approved professionals.

## Epic 10: Consultation Requests

- Build consultation request form.
- Create consultation status workflow.
- Build sent/received consultation list.
- Allow professionals to accept/reject.
- Optionally create conversation when request is created or accepted.

Deliverable:

- Users and professionals can manage consultation requests.

## Epic 11: Messaging

- Build conversation list.
- Build message thread.
- Add send message action.
- Verify participants before reading/sending.

Deliverable:

- Basic persistent messaging works.

## Epic 12: Admin Panel

- Build admin dashboard.
- Build verification queue.
- Implement approve/reject actions.
- Build user list.
- Add admin-only route protection.

Deliverable:

- Admin can verify trainers and dietitians.
- Non-admin users cannot access admin pages/actions.

## Epic 13: Testing and Quality

- Add unit tests for pure services where practical:
  - RBAC helpers.
  - Haversine distance.
  - Matching score.
  - Mock AI analyzer.
- Add validation tests for Zod schemas if test tooling is configured.
- Manually verify role flows with seeded users.
- Run lint and build.

Deliverable:

- Build passes.
- Core services have basic test coverage or documented manual verification.

## Dependency Order

| Module | Depends on |
| --- | --- |
| Auth | Project foundation, Prisma |
| Profile | Auth, RBAC |
| Gyms | Prisma, Auth |
| Buddy matching | Profile, Auth |
| Workouts | Prisma, Profile optional |
| Nutrition | Auth, Profile optional, uploads |
| Professional profiles | Auth, RBAC, uploads |
| Verification | Professional profiles, Admin RBAC |
| Consultations | Professional profiles, Auth |
| Messaging | Auth, Consultations optional |
| Admin panel | Auth, RBAC, all admin-visible data |

