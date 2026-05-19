# Database Schema

## Schema Goals

The database must support authentication, roles, profiles, gyms, buddy matching, workout recommendations, nutrition tracking, mock meal analysis, professional verification, consultation requests, messaging, and admin workflows.

Prisma should be the source of truth. The current `public/supabase-schema.sql` can be treated as an early draft, but the new implementation should use `prisma/schema.prisma`.

## Enums

| Enum | Values |
| --- | --- |
| `Role` | USER, TRAINER, DIETITIAN, ADMIN |
| `FitnessLevel` | BEGINNER, INTERMEDIATE, ADVANCED |
| `MuscleGroup` | CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE, CARDIO, FULL_BODY |
| `VerificationStatus` | NOT_SUBMITTED, PENDING, APPROVED, REJECTED |
| `ConsultationStatus` | PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED |
| `ConversationType` | DIRECT, CONSULTATION |

## Core Models

### User

Stores authentication identity and role.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| email | String | Unique |
| passwordHash | String | Required for credentials auth |
| role | Role | Default USER |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations:

- One Profile.
- Optional TrainerProfile.
- Optional DietitianProfile.
- Many MealEntry.
- Many ConversationParticipant.
- Many sent Message.
- Many ConsultationRequest as requester.

### Profile

Stores shared profile and fitness preference data.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| userId | String | Unique foreign key |
| fullName | String | Required |
| bio | String? | Optional |
| city | String? | Optional |
| latitude | Float? | Approximate location |
| longitude | Float? | Approximate location |
| fitnessLevel | FitnessLevel | Default BEGINNER |
| goals | String[] or Json | MVP can use string array |
| preferredMuscleGroups | MuscleGroup[] | Used by matching and recommendations |
| dailyCalorieGoal | Int | Default 2200 |
| dailyProteinGoal | Int | Default 120 |
| dailyCarbGoal | Int | Default 250 |
| dailyFatGoal | Int | Default 70 |

### Gym

Seeded gym discovery data.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| name | String | Required |
| description | String? | Optional |
| address | String? | Optional |
| city | String? | Optional |
| latitude | Float | Required |
| longitude | Float | Required |
| rating | Float | Seeded value |
| amenities | String[] or Json | MVP list |

Relations:

- Many TrainerProfile.

### TrainerProfile

Professional profile for TRAINER role.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| userId | String | Unique foreign key |
| gymId | String? | Optional relation to Gym |
| headline | String? | Short profile title |
| expertise | String[] or Json | Specialty list |
| experienceYears | Int | Default 0 |
| certificatePath | String? | Local upload path |
| verificationStatus | VerificationStatus | Default NOT_SUBMITTED |
| verificationNote | String? | Admin note |
| verifiedAt | DateTime? | Set on approval |

### DietitianProfile

Professional profile for DIETITIAN role.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| userId | String | Unique foreign key |
| headline | String? | Short profile title |
| specialties | String[] or Json | Specialty list |
| experienceYears | Int | Default 0 |
| certificatePath | String? | Local upload path |
| verificationStatus | VerificationStatus | Default NOT_SUBMITTED |
| verificationNote | String? | Admin note |
| verifiedAt | DateTime? | Set on approval |

## Workout Models

### Exercise

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| name | String | Required |
| muscleGroup | MuscleGroup | Required |
| level | FitnessLevel | Required |
| sets | Int | Required |
| reps | String | Allows ranges like `8-10` |
| instructions | String? | Optional |

### WorkoutTemplate

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| title | String | Required |
| muscleGroup | MuscleGroup | Required |
| level | FitnessLevel | Required |
| description | String? | Optional |

### WorkoutTemplateExercise

Join model for ordered workout template exercises.

| Field | Type | Notes |
| --- | --- | --- |
| templateId | String | Foreign key |
| exerciseId | String | Foreign key |
| order | Int | Display order |

## Nutrition Models

### MealEntry

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| userId | String | Owner |
| mealName | String | Required |
| imagePath | String? | Local upload path |
| calories | Int | Required |
| protein | Float | Grams |
| carbs | Float | Grams |
| fat | Float | Grams |
| loggedAt | DateTime | Defaults to now |
| source | String | MANUAL or MOCK_AI |

### MealAnalysis

Stores mock AI result metadata.

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| mealEntryId | String | Unique foreign key |
| estimatedName | String | Mock result |
| confidence | Float | 0-1 |
| explanation | String | Must mention demo estimate |
| rawResult | Json | Replaceable module output |

## Consultation Models

### ConsultationRequest

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| requesterId | String | User requesting help |
| trainerProfileId | String? | Target trainer |
| dietitianProfileId | String? | Target dietitian |
| status | ConsultationStatus | Default PENDING |
| topic | String | Required |
| message | String | Required |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Only one of `trainerProfileId` or `dietitianProfileId` should be set.

## Messaging Models

### Conversation

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| type | ConversationType | DIRECT or CONSULTATION |
| consultationRequestId | String? | Optional relation |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### ConversationParticipant

| Field | Type | Notes |
| --- | --- | --- |
| conversationId | String | Foreign key |
| userId | String | Foreign key |

Composite unique key:

- `conversationId + userId`

### Message

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| conversationId | String | Foreign key |
| senderId | String | Foreign key |
| content | String | Required |
| createdAt | DateTime | Auto |
| readAt | DateTime? | Optional |

## Admin and Audit Fields

For MVP, admin actions can be represented by fields on verification and consultation models. If more traceability is needed later, add:

### AdminAuditLog

| Field | Type | Notes |
| --- | --- | --- |
| id | String/cuid | Primary key |
| adminId | String | Admin user |
| action | String | Example: APPROVE_TRAINER |
| targetType | String | Example: TrainerProfile |
| targetId | String | Target record id |
| note | String? | Optional |
| createdAt | DateTime | Auto |

## Recommended Indexes

- `User.email` unique.
- `Profile.userId` unique.
- `Profile.latitude + Profile.longitude` regular index for MVP filtering.
- `Gym.latitude + Gym.longitude` regular index for map/list queries.
- `Exercise.muscleGroup + Exercise.level`.
- `MealEntry.userId + MealEntry.loggedAt`.
- `Message.conversationId + Message.createdAt`.
- `ConsultationRequest.requesterId`.
- `ConsultationRequest.status`.
- `TrainerProfile.verificationStatus`.
- `DietitianProfile.verificationStatus`.

## Seed Data Requirements

Seed command should create:

- Admin: `admin@socialgym.test`.
- Demo user: `user@socialgym.test`.
- Demo trainer: `trainer@socialgym.test`.
- Demo dietitian: `dietitian@socialgym.test`.
- At least 3 gyms around Istanbul coordinates.
- At least 2 trainers and 2 dietitians, with one approved and one pending professional.
- Exercises for each major muscle group and level.
- At least 2 workout templates.
- Example meal entries with calories/macros.
- Example conversation between two users.

