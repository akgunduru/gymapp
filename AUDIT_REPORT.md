# Social Gym System — Graduation Project Audit Report

**Date:** May 30, 2026  
**Scope:** Read-only comprehensive review — no code was modified  
**Project:** Social Gym System · Next.js 15 / React 19 / TypeScript / Prisma 6 / PostgreSQL  

---

## Severity Legend

| Label | Meaning |
|---|---|
| 🔴 CRITICAL | Blocks real-world deployment or causes data loss / security breach |
| 🟠 IMPORTANT | Visible gap that weakens the project but has a clear fix |
| 🟡 MINOR | Small issue; unlikely to be noticed in a demo, but worth noting |
| 🟢 OPTIONAL | Enhancement idea for future work; no impact on passing grade |

---

## 1. Security & Authentication

### Strengths
- Custom HMAC-SHA256 session tokens with `timingSafeEqual` prevent timing attacks — a sophisticated choice that shows security awareness.
- Passwords are hashed with bcryptjs before storage; plaintext is never persisted.
- Role-based guards (`requireUser`, `requireRole`, `requireAnyRole`) are applied consistently across all protected Server Actions and pages.
- Prisma parameterized queries eliminate SQL injection risk entirely.
- Atomic registration transaction (User + UserProfile + FitnessPreference in one `db.$transaction`) prevents partial user creation.

### Findings

**🔴 CRITICAL — AUTH_SECRET falls back to a hardcoded string**  
`lib/auth.ts` uses `process.env.AUTH_SECRET || "development-social-gym-secret"`. The `.env` file contains no `AUTH_SECRET` variable. This means every environment — including production — uses the same public fallback string to sign session tokens. Anyone who reads the source code can forge valid session cookies.  
*Fix: Add `AUTH_SECRET=<random-64-char-string>` to `.env` and remove the fallback.*

**🔴 CRITICAL — AI Coach API route is unauthenticated**  
`app/api/ai-coach/route.ts` calls the Groq API (billed per token) without any `requireUser()` check. Any unauthenticated HTTP client can hit `POST /api/ai-coach` repeatedly, draining the API quota and incurring cost.  
*Fix: Add `await requireUser()` at the top of the route handler.*

**🟠 IMPORTANT — Demo credentials are pre-filled in login form HTML**  
`app/login/page.tsx` sets `defaultValue="admin@socialgym.test"` and `defaultValue="DemoPass123!"` directly on the form inputs, and renders a visible "Demo accounts" callout box. These values appear in the rendered HTML source. This is a developer convenience that looks unprofessional in a production context and is a textbook security anti-pattern.  
*Fix: Remove `defaultValue` props before any public demo; use placeholder text instead.*

**🟡 MINOR — GROQ_API_KEY is committed in .env**  
The `.env` file contains the live Groq API key. If this file is ever pushed to a public repository, the key is immediately exposed. Ensure `.env` is in `.gitignore` (confirm this is the case) and rotate the key after any accidental push.

---

## 2. Frontend Quality

### Strengths
- Consistent Tailwind CSS v4 design language across all pages; spacing, colour, and typography are uniform.
- Leaflet map integration with dynamic imports (`next/dynamic`, `ssr: false`) is handled correctly — a common pitfall that was avoided.
- Form validation uses Zod schemas on the server side, which is the correct pattern for Server Actions.
- Loading and error states are present on most interactive components.
- The component tree is logically structured: `app/` holds routes, `components/` holds UI, `lib/` holds logic.

### Findings

**🔴 CRITICAL — Dashboard is entirely hardcoded mock data**  
`components/dashboard/dashboard-placeholder.tsx` contains static arrays for streak, calories, macros, gym list, buddy matches, messages, and recent workouts. Although a `user` prop is passed in, none of these arrays are populated from the database. A grader who logs in and sees their own name but static fake activity may notice this immediately.  
*This is the highest-visibility gap in the entire project.*

**🟠 IMPORTANT — Admin page is an empty placeholder**  
`app/admin/page.tsx` is correctly role-guarded with `requireRole("ADMIN")` but renders only a `PagePlaceholder` with the text "Role-protected verification and management screens will be implemented after RBAC." RBAC is fully implemented, but the UI behind it is missing.

**🟠 IMPORTANT — Gym map uses hardcoded Istanbul coordinates**  
`components/gyms/gym-map.tsx` defines a `GYM_TEMPLATES` array with fixed lat/lng offsets from Istanbul city centre. The map renders a real Leaflet instance but all pin data is fabricated. No database query is involved.

**🟡 MINOR — `next/image` domain whitelist is narrow**  
`next.config.ts` only permits `images.unsplash.com`. All professional photos currently come from Unsplash so this works, but any future image source (user avatars from other CDNs, gym photos) will throw a runtime error without a config update.

**🟡 MINOR — `prototype-vite/` directory at project root**  
An old Vite prototype with its own `package.json` and `node_modules` lives at the repository root. It is not part of the Next.js build but adds noise and will confuse anyone reviewing the project structure.

---

## 3. Backend & Database

### Strengths
- Prisma schema is well-designed: 15+ models, UUID primary keys, proper cascade rules (`onDelete: Cascade`), composite indexes where needed, and clear enum definitions for roles and statuses.
- Buddy matching read/write logic (`lib/matching-actions.ts`) is correct: it checks for existing active matches, uses `db.$transaction()` for the accept action, and verifies match ownership before messaging.
- Session management (`lib/auth.ts`) cookies are `httpOnly` and `sameSite: "lax"`.
- Nutrition logging and meal entry persistence appear fully wired to the database.
- `requireRole` and `requireAnyRole` are applied at the Server Action level, not just the page level — correct defense in depth.

### Findings

**🔴 CRITICAL — Consultation booking silently fakes success**  
`lib/consultation-actions.ts` — `requestConsultationAction()` receives a `professionalDbId`. For all professionals rendered on the professionals page, this ID is `null` (they come from the static mock data file, not the database). The action checks for null and immediately returns `{ success: true }` without creating any `ConsultationRequest` record. The user sees a success toast; nothing is saved.

**🟠 IMPORTANT — Professionals data is 100% static mock data**  
`lib/professionals-data.ts` (560 lines) defines 8 trainers and 4 dietitians as TypeScript constants — names, bios, testimonials, schedules, ratings, and Unsplash photos. No database query is made. The `getCompatibilityScore()` function does simple in-memory goal intersection. This means the "Browse Professionals" feature is a static catalogue, not a live system.

**🟠 IMPORTANT — `lib/matching-score.ts` is dead code**  
`calculateMatchingScore()` in this file is never imported by any page or component. The active buddy scoring is in `lib/buddy-score.ts`. The dead file creates confusion about which scoring system is authoritative.

**🟡 MINOR — `MealImageAnalysis` model is schema-ready but unwired**  
The Prisma schema includes a `MealImageAnalysis` model with an `AI_IMAGE` source enum value, suggesting image-based meal analysis was planned. No UI or API route uses it. This is not a defect — it is noted as an unrealised feature.

---

## 4. AI / ML Features

### Strengths
- Groq API integration (`app/api/ai-coach/route.ts`) is production-quality: structured JSON prompt, proper error handling for 401/429/400/502, and response shape validation.
- The AI Coach prompt includes user profile context (fitness level, goals, equipment), making responses personalised rather than generic.
- Nutrition ML (`lib/nutrition-ml.ts`) loads a real decision tree trained in Python, walks it in TypeScript, and produces a health score, goal compatibility rating, and badge labels — a technically impressive client-side inference pipeline.
- The nutrition model training script (`ml/train_nutrition_model.py`) uses a proper ML pipeline: feature engineering, `DecisionTreeClassifier(max_depth=7, min_samples_leaf=18)` to avoid overfitting, cross-validation, and JSON export. This demonstrates academic rigour.
- Food NLP parsing (`lib/nutrition-parser.ts`) uses both exact regex matching and Levenshtein fuzzy fallback — a two-tier NLP strategy that shows genuine engineering thought.
- Buddy scoring (`lib/buddy-score.ts`) implements a principled multi-factor weighted score (fitness level, shared goals, shared muscle groups, city/district proximity, workout frequency, Haversine distance) that is well-documented and academically defensible.

### Findings

**🟠 IMPORTANT — Python workout ML model is CLI-only, not integrated into Next.js**  
`ml/predict_workout.py` and `workout_model.pkl` exist and work correctly from the terminal. However, the Next.js application never calls this model. The frontend's workout recommender (`workout-recommender.tsx`) implements its own JavaScript scoring function independently. The Python model is academically sound but its disconnect from the live app is a gap a grader could probe.  
*The cleanest fix is a `/api/workout-recommend` route that shells out to the Python script or reads the pkl via a microservice.*

**🟡 MINOR — `buildAliasEntries()` is called on every food parse, not memoized**  
`lib/nutrition-parser.ts` rebuilds the full 200+ food alias table on every call to `findExactFoodMentions()`. In a real system this would be a measurable performance cost. For a demo it is unlikely to matter, but it is worth noting.

**🟢 OPTIONAL — `MealImageAnalysis` pipeline could be demoed**  
The schema, the `AI_IMAGE` enum, and a Groq vision-capable model would make image-based meal analysis straightforward to implement as a demo feature. It would strengthen the "AI-powered" narrative significantly.

---

## 5. Presentation Readiness

### Strengths
- The login page provides demo accounts and pre-filled credentials, making live demos frictionless.
- The UI is visually polished: consistent card layouts, colour palette, and iconography throughout.
- The Leaflet map, buddy matching flow, and AI Coach chat window are all visually compelling demo moments.
- The nutrition tracker with ML predictions and badge labels is an impressive interactive feature.

### Findings

**🔴 CRITICAL — The demo's most visible screen (Dashboard) shows fake data**  
Any grader who logs in, navigates to the dashboard, then cross-references what they see with the database will immediately identify that the numbers are static. Streak, calorie counts, macro rings, gym list, buddy list, and messages are all hardcoded constants regardless of who is logged in or what data is in the database.

**🟠 IMPORTANT — Consultation flow produces a fake success**  
During a live demo, clicking "Book Consultation" shows a green success toast but creates no record. If a grader asks "where does this booking appear?" or opens Prisma Studio to verify, the deception is obvious.

**🟠 IMPORTANT — Admin panel is an empty placeholder behind real RBAC**  
If a grader logs in as an admin to verify the role system works, they will see a blank page with a "will be implemented" message. The guard works but the guarded content does not exist.

**🟡 MINOR — `prototype-vite/` pollutes the repository**  
If a grader inspects the project root (e.g., via `ls` or GitHub), the `prototype-vite/` directory makes the project look unfinished or disorganised.

**🟡 MINOR — Demo credentials in HTML source**  
The pre-filled login credentials (`admin@socialgym.test` / `DemoPass123!`) appear in the rendered page HTML. For a graduation demo this is not a security risk, but it looks like a development shortcut if anyone inspects the source.

---

## 6. Codebase Quality

### Strengths
- TypeScript is used consistently and strictly; no `any` types were observed in the reviewed files.
- Server Actions follow the correct Next.js 15 pattern: `"use server"` directive, Zod validation, structured return objects.
- File naming and directory structure follow Next.js App Router conventions precisely.
- Utility functions (`lib/`) are well-separated from UI components (`components/`) and route handlers (`app/`).
- The Prisma schema uses descriptive field names and comments, making it self-documenting.
- `db.$transaction()` is used for all multi-table writes, which is correct.

### Findings

**🟠 IMPORTANT — Dead code: `lib/matching-score.ts`**  
This file exports `calculateMatchingScore()` which is never imported. Its existence alongside the active `lib/buddy-score.ts` creates confusion about which scoring function the system uses.

**🟡 MINOR — `lucide-react` version `^1.8.0` is suspect**  
Lucide React's current stable series is in the `0.x` range; `^1.8.0` is either a pre-release, a fork, or a typo. If this installs correctly it is fine, but it should be verified — a breaking change in an icon library could silently render no icons.

**🟡 MINOR — `dev` script deletes `.next` on every start**  
`"dev": "npm run clean && next dev"` runs `rm -rf .next` before starting the development server. This forces a full rebuild every time `npm run dev` is run, significantly slowing startup. It is a convenience workaround for a caching bug that should not be the default.

**🟡 MINOR — `buildAliasEntries()` not memoized (repeated in ML section)**  
Repeated per-call construction of the 200+ entry alias table is a missed optimisation. A module-level constant would fix it.

**🟢 OPTIONAL — Consider a `lib/constants.ts` for shared configuration**  
Values like level neighbours, equipment compatibility maps, and scoring weights appear inline in multiple files. Centralising them would improve maintainability.

---

## 7. Deployment Readiness

### Strengths
- `next.config.ts` is minimal and correct: only essential configuration, no experimental flags that could break in production.
- Prisma is set up with proper migration workflow (`prisma migrate dev`).
- Environment variables are separated from code via `.env`.
- The project has a clear `build` and `start` script for production.

### Findings

**🔴 CRITICAL — `DATABASE_URL` points to `localhost`**  
The `.env` file contains `postgresql://postgres:postgres@localhost:5432/social_gym_system`. This only works on a machine running PostgreSQL locally. For any deployment (Vercel, Railway, Render, Docker) this must be replaced with a hosted database URL. There is no `DATABASE_URL` fallback or documentation of how to configure it for deployment.

**🟠 IMPORTANT — No `AUTH_SECRET` in `.env`**  
As noted in the Security section, the secret used to sign session tokens is a hardcoded fallback. This is both a security and a deployment issue: rotating the secret requires a code change rather than an environment variable update.

**🟡 MINOR — `prototype-vite/` adds dead weight to the repository**  
The old prototype directory with its own `node_modules` inflates clone size and could interfere with monorepo tooling if one is ever added. It should be deleted before final submission.

**🟡 MINOR — No `.env.example` file**  
There is no `.env.example` or documentation listing which environment variables are required. A new developer (or a grader trying to run the project) must read the source code to discover that `DATABASE_URL` and `GROQ_API_KEY` are required.

**🟢 OPTIONAL — Add a `docker-compose.yml` for local PostgreSQL**  
The project requires a running Postgres instance. A single `docker-compose.yml` would make setup one command for anyone evaluating the project.

---

## Summary Table

| # | Finding | Area | Severity |
|---|---|---|---|
| 1 | AUTH_SECRET falls back to hardcoded string | Security | 🔴 CRITICAL |
| 2 | AI Coach API route unauthenticated | Security | 🔴 CRITICAL |
| 3 | Dashboard is entirely hardcoded mock data | Frontend / DB | 🔴 CRITICAL |
| 4 | Consultation booking silently fakes success | Backend | 🔴 CRITICAL |
| 5 | DATABASE_URL points to localhost only | Deployment | 🔴 CRITICAL |
| 6 | Demo credentials pre-filled in login HTML | Security | 🟠 IMPORTANT |
| 7 | Admin page is an empty placeholder | Frontend | 🟠 IMPORTANT |
| 8 | Gym map uses hardcoded Istanbul coordinates | Frontend | 🟠 IMPORTANT |
| 9 | Professionals data is 100% static mock | Backend | 🟠 IMPORTANT |
| 10 | `lib/matching-score.ts` is dead code | Code Quality | 🟠 IMPORTANT |
| 11 | Python workout ML not integrated into Next.js | AI/ML | 🟠 IMPORTANT |
| 12 | `lucide-react ^1.8.0` version is suspect | Code Quality | 🟡 MINOR |
| 13 | `next/image` domain whitelist is narrow | Frontend | 🟡 MINOR |
| 14 | `prototype-vite/` directory at project root | Code Quality | 🟡 MINOR |
| 15 | `buildAliasEntries()` not memoized | AI/ML | 🟡 MINOR |
| 16 | `dev` script deletes `.next` on every start | Code Quality | 🟡 MINOR |
| 17 | No `.env.example` file | Deployment | 🟡 MINOR |
| 18 | GROQ_API_KEY committed in `.env` | Security | 🟡 MINOR |
| 19 | `MealImageAnalysis` unwired | AI/ML | 🟢 OPTIONAL |
| 20 | Add `docker-compose.yml` for local Postgres | Deployment | 🟢 OPTIONAL |
| 21 | Centralise shared constants in `lib/constants.ts` | Code Quality | 🟢 OPTIONAL |
| 22 | Wire Python workout model as `/api/workout-recommend` | AI/ML | 🟢 OPTIONAL |

---

## Overall Assessment

### What the project does well
The Social Gym System demonstrates strong architectural thinking. The Prisma schema is professionally designed, Server Actions are used correctly throughout, and the AI/ML layer — Groq integration, client-side decision tree inference, Levenshtein NLP, Haversine buddy scoring — is genuinely sophisticated and would impress a technical grader. The codebase is TypeScript-strict, well-structured, and follows Next.js 15 App Router conventions precisely.

### Where the project is fragile
The core risk is the **real vs. mock data split**. Several high-visibility features — the dashboard, the professionals directory, the gym map, the consultation flow — are backed by hardcoded data or silent no-ops rather than real database operations. The backend models for these features exist in the Prisma schema; the gap is in the wiring. A grader who navigates the happy path during a prepared demo may not notice. A grader who probes the data will.

### Recommended priority order for fixes (if changes are permitted later)
1. Wire the Dashboard to real DB queries (highest visibility, highest risk)
2. Add `AUTH_SECRET` to `.env` and remove the hardcoded fallback
3. Add `requireUser()` to the AI Coach API route
4. Fix the consultation flow to create real DB records
5. Remove `prototype-vite/`, dead `lib/matching-score.ts`, and demo credentials
6. Wire the Python workout model as an API endpoint
