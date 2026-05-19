# Product Analysis

## Product Summary

Social Gym System is a web-only full-stack application for people who want to discover gyms, find compatible workout partners, receive basic workout recommendations, track nutrition, and consult verified trainers or dietitians. The system should also give administrators a simple workflow for verifying professional accounts and moderating platform data.

The graduation-project version can remain an MVP. It does not need production-grade matching, AI, payment, real-time chat infrastructure, or enterprise security. It must, however, demonstrate the complete end-to-end system shape with persistent data, role-based access control, seed data, and isolated modules.

## Primary Users

| User type | Main goal | Core actions |
| --- | --- | --- |
| USER | Manage fitness journey and find nearby support | Register, edit profile, set preferences, find gym buddies, discover gyms, track meals, request consultations, message others |
| TRAINER | Present professional profile and respond to users | Maintain trainer profile, upload certificate, receive verification status, receive consultation requests, message users |
| DIETITIAN | Present professional profile and help with nutrition | Maintain dietitian profile, upload certificate, receive verification status, receive consultation requests, message users |
| ADMIN | Keep platform trustworthy | Review professional verification requests, manage users, view gyms/workouts, moderate basic content |

## Current Repository Assessment

The current project is a Vite + React + TypeScript frontend demo. It contains useful MVP ideas and mock data, but it does not yet satisfy the requested target architecture.

| Requirement | Current state | Coverage | Notes |
| --- | --- | ---: | --- |
| User registration and login | Mock local form only | Partial | No persisted users, password hashing, JWT/NextAuth session, or protected backend routes |
| Role-based access control | Missing | None | No USER/TRAINER/DIETITIAN/ADMIN roles in code |
| User profile and fitness preferences | Minimal state | Partial | Workout focus and level exist in local state; no full profile or persistence |
| Location-based gym buddy matching | Mock cards | Partial | Uses static distance values and focus filter; no database query or geospatial calculation |
| Gym discovery | Mock gyms and map iframe | Partial | Gym seed data exists; Leaflet dependency exists, but current UI uses OSM iframe |
| Workout recommendation | Mock exercise filter | Partial | Muscle group and level filtering exists in memory |
| Nutrition tracking | Calories only | Partial | No macros, date filtering, persistence, or per-user entries |
| AI meal image analysis demo | Mock estimate exists | Partial | Browser-only local estimate; no upload persistence or replaceable mock AI module |
| Trainer and dietitian profiles | Mock lists | Partial | Trainer data is nested under gyms; no account roles or public professional pages |
| Professional verification by admin | Missing | None | Certificate concepts exist in mock trainer data, but no admin workflow |
| Consultation requests | UI notice only | Partial | Dietitian CTA sets a temporary message; no request model or workflow |
| Basic messaging | Mock chat state | Partial | No conversations table, persistence, or access checks |
| Admin panel | Missing | None | No admin screens or actions |
| Next.js 15 App Router | Missing | None | Current app is Vite React |
| PostgreSQL + Prisma | Missing | None | There is a Supabase SQL draft, not Prisma |
| shadcn/ui | Missing | None | Current UI uses hand-written Tailwind classes |
| Local file upload | Browser preview only | Partial | No server-side file storage for meals or certificates |

## Estimated Readiness

| Area | Estimated readiness |
| --- | ---: |
| Product concept coverage | 45-50% |
| UI/demo coverage | 35-40% |
| Target full-stack implementation | 10-15% |
| Overall MVP readiness against the requested stack | 25-30% |

The application is fixable. The best path is not to patch the existing Vite app into shape piece by piece. The cleaner approach is to use the current project as a prototype and migrate the product into a Next.js 15 full-stack monolith with Prisma, PostgreSQL, proper auth, roles, and module boundaries.

## Reusable Assets From Current App

- Domain ideas: gyms, trainers, dietitians, buddy users, exercises, meals.
- Mock data: gym names, trainer expertise, dietitian specialties, workout examples.
- UI concepts: one-screen MVP modules, map, buddy cards, workout filter, meal upload, chat widget.
- Mock AI heuristic: description and image-size based calorie estimation can become the first implementation of a replaceable mock analyzer.

## Main Product Risks

- Scope creep: building every module deeply would be too large for the first version.
- Auth and RBAC: must be implemented early because all later modules depend on user identity and role.
- Data model coupling: professional profiles, verification, consultations, and messaging must be separated clearly.
- File upload: local uploads should be simple and safe, with predictable paths and file type validation.
- Map/matching expectations: matching should be honest as an MVP ranking algorithm, not presented as advanced AI.

## MVP Success Criteria

The MVP is successful when:

- A user can register, log in, and use protected pages.
- Users have a profile with fitness level, goals, preferred muscle groups, and approximate location.
- Users can discover seeded gyms on a Leaflet/OpenStreetMap view.
- Users can find compatible gym buddies based on location and preferences.
- Users can receive workout recommendations by muscle group and level.
- Users can upload a meal image, get a mock analysis, and track daily calories/macros.
- Trainers and dietitians can maintain profiles and upload certificate files.
- Admins can approve or reject professional verification requests.
- Users can create consultation requests and exchange basic messages.
- Admins can access an admin panel; non-admin users cannot.

