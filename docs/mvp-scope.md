# MVP Scope

## MVP Objective

Build a complete but intentionally simple Social Gym System that proves the graduation project requirements with a real database, authentication, role-based access, modular code organization, and seeded demo data.

The MVP should prioritize functional correctness and clear module boundaries over advanced algorithms, real AI, real-time messaging, payment, or production operations.

## In Scope

### Authentication and Roles

- Credentials-based registration and login.
- Password hashing.
- Session with JWT or NextAuth credentials.
- Roles: USER, TRAINER, DIETITIAN, ADMIN.
- Route and action-level authorization helpers.
- Demo seed users for each role.

### User Profile and Fitness Preferences

- Profile page for name, bio, avatar path, city, approximate latitude/longitude.
- Fitness level: BEGINNER, INTERMEDIATE, ADVANCED.
- Goals and preferred muscle groups.
- Preference data used by buddy matching and workout recommendations.

### Gym Discovery

- Seeded gyms stored in PostgreSQL.
- Gym list with search/filter.
- Leaflet/OpenStreetMap map.
- Gym detail with location, rating, amenities, and associated trainers.

### Gym Buddy Matching

- Matching based on approximate distance, fitness level, preferred muscle groups, and goals.
- Ranked list of candidate users.
- Simple profile card and message/consult action.
- No advanced geospatial service required.

### Workout Recommendation

- Seeded exercises and workout templates.
- Filters by muscle group and fitness level.
- Recommendation page that returns a small plan.
- Admin can view or manage basic workout seed records in a later MVP step if time allows.

### Nutrition Tracking

- Daily meal entries.
- Calories, protein, carbs, fat.
- Daily totals and remaining goals.
- Meal image upload to local storage.
- Mock AI analyzer that returns estimated food name, calories, and macros.

### Professional Profiles

- Trainer profile with expertise, years of experience, gym relation, certificate upload, verification status.
- Dietitian profile with specialties, years of experience, certificate upload, verification status.
- Public listing for verified professionals.

### Professional Verification

- Admin panel queue for trainer/dietitian verification requests.
- Certificate file reference.
- Approve/reject action with optional admin note.
- Verification status visible to the professional.

### Consultation Requests

- USER can request consultation from TRAINER or DIETITIAN.
- Professional can view incoming requests.
- Status: PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED.
- MVP can use simple status changes without calendars or payment.

### Messaging

- Basic conversation list.
- Message send/read flow.
- Database-backed messages.
- Polling or page refresh is enough; real-time sockets are out of scope.

### Admin Panel

- Admin dashboard.
- User list and role overview.
- Professional verification queue.
- Basic gym/workout/nutrition data visibility.

## Out of Scope for MVP

- Mobile native apps.
- Real AI image recognition.
- Payment/subscription system.
- Video consultation.
- Real-time WebSocket messaging.
- Push notifications.
- Complex recommendation engine.
- Full moderation/audit system.
- External map/geocoding paid services.
- Production-grade object storage.
- Multi-language support beyond existing Turkish-friendly labels.

## Role Permissions Matrix

| Feature | USER | TRAINER | DIETITIAN | ADMIN |
| --- | --- | --- | --- | --- |
| Register/login | Yes | Yes | Yes | Seed/manual or protected create |
| Edit own profile | Yes | Yes | Yes | Yes |
| Edit fitness preferences | Yes | Optional | Optional | Yes |
| Discover gyms | Yes | Yes | Yes | Yes |
| View buddy matches | Yes | Yes | Yes | Yes |
| Send messages | Yes | Yes | Yes | Yes |
| Track nutrition | Yes | Yes | Yes | Yes |
| Upload meal image | Yes | Yes | Yes | Yes |
| Maintain trainer profile | No | Yes | No | Yes |
| Maintain dietitian profile | No | No | Yes | Yes |
| Upload certificate | No | Yes | Yes | Yes |
| Request consultation | Yes | Yes | Yes | Yes |
| Receive professional requests | No | Yes | Yes | Yes |
| Review verification | No | No | No | Yes |
| Access admin panel | No | No | No | Yes |

## MVP Acceptance Checklist

- Protected routes redirect unauthenticated users to login.
- Role-only screens reject unauthorized users.
- Seed command creates gyms, exercises, workouts, and demo users.
- All primary data survives page refresh because it is database-backed.
- Meal and certificate uploads are stored locally and referenced by database records.
- Mock AI module is isolated behind a clean TypeScript function.
- Admin can approve/reject trainer and dietitian verification.
- No module depends directly on another module's UI internals.

