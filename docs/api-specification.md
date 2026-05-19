# API Specification

## API Style

Use Server Actions for form-based mutations where possible. Use API route handlers for file uploads and any endpoint that benefits from multipart handling or client-side fetching.

Every mutation must follow this sequence:

1. Authenticate user.
2. Validate input with Zod.
3. Authorize by role/ownership.
4. Execute feature service.
5. Return typed result or redirect/revalidate.

## Error Shape

For route handlers, use a consistent JSON error shape:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in."
  }
}
```

Recommended codes:

- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `UPLOAD_ERROR`
- `INTERNAL_ERROR`

## Auth

### `POST /register`

Implementation form: Server Action.

Role access: public.

Input:

- fullName
- email
- password
- role: USER, TRAINER, DIETITIAN

Output:

- Creates user and profile.
- Redirects to dashboard or login.

Rules:

- ADMIN registration should not be public.
- Password minimum length should be enforced.
- Email must be unique.

### `POST /login`

Implementation form: NextAuth credentials or custom server action.

Role access: public.

Input:

- email
- password

Output:

- Creates session.
- Redirects to dashboard.

### `POST /logout`

Implementation form: Server Action.

Role access: authenticated.

Output:

- Clears session.
- Redirects to login.

## Profile

### `GET /profile`

Implementation form: server-rendered page.

Role access: authenticated.

Returns:

- User identity.
- Profile fields.
- Professional profile status when applicable.

### `updateProfileAction`

Role access: owner or ADMIN.

Input:

- fullName
- bio
- city
- latitude
- longitude
- fitnessLevel
- goals
- preferredMuscleGroups
- calorie and macro goals

Output:

- Updated profile.
- Revalidates profile, buddies, nutrition pages.

## Gyms

### `GET /gyms`

Implementation form: server-rendered page with client map component.

Role access: authenticated.

Query:

- city optional
- search optional

Returns:

- Gym cards.
- Map marker data.

### `GET /api/gyms`

Implementation form: route handler if client-side map needs JSON.

Role access: authenticated.

Returns:

- id
- name
- latitude
- longitude
- rating
- amenities
- trainer summary

## Buddy Matching

### `GET /buddies`

Implementation form: server-rendered page.

Role access: authenticated.

Returns:

- Ranked users by compatibility.

Matching factors:

- Distance from current user's stored location.
- Shared preferred muscle groups.
- Similar fitness level.
- Shared goals.

### `createDirectConversationAction`

Role access: authenticated.

Input:

- targetUserId

Output:

- Existing or new conversation id.
- Redirects to message thread.

Rules:

- User cannot create conversation with self.
- Block duplicate direct conversation creation.

## Workouts

### `GET /workouts`

Role access: authenticated.

Query:

- muscleGroup optional
- level optional

Returns:

- Recommended exercises.
- Workout templates.

### `GET /api/workout-recommendations`

Role access: authenticated.

Query:

- muscleGroup
- level

Returns:

- list of exercises with sets, reps, and instructions.

## Nutrition

### `GET /nutrition`

Role access: authenticated.

Returns:

- Daily calorie and macro goals.
- Today's meal entries.
- Daily totals.
- Upload form.

### `createMealEntryAction`

Role access: authenticated owner.

Input:

- mealName
- calories
- protein
- carbs
- fat
- loggedAt optional

Output:

- Created meal entry.
- Revalidates nutrition page.

### `POST /api/uploads/meal-image`

Role access: authenticated.

Content type:

- `multipart/form-data`

Input:

- image file
- description optional

Output:

```json
{
  "mealEntry": {
    "id": "meal_id",
    "mealName": "Grilled chicken bowl",
    "imagePath": "/uploads/meals/example.webp",
    "calories": 610,
    "protein": 42,
    "carbs": 58,
    "fat": 18
  },
  "analysis": {
    "confidence": 0.72,
    "explanation": "Mock demo estimate based on file metadata and description."
  }
}
```

Rules:

- Validate file type and size.
- Store file locally.
- Run mock analyzer.
- Create MealEntry and MealAnalysis.

## Professionals

### `GET /professionals`

Role access: authenticated.

Query:

- type: TRAINER or DIETITIAN optional
- specialty optional
- city optional

Returns:

- Verified trainers and dietitians.

### `updateTrainerProfileAction`

Role access: TRAINER owner or ADMIN.

Input:

- gymId optional
- headline
- expertise
- experienceYears

### `updateDietitianProfileAction`

Role access: DIETITIAN owner or ADMIN.

Input:

- headline
- specialties
- experienceYears

### `POST /api/uploads/certificate`

Role access: TRAINER, DIETITIAN, ADMIN.

Content type:

- `multipart/form-data`

Input:

- certificate file
- professionalType

Output:

- Updated certificate path.
- Verification status becomes PENDING.

## Verification

### `GET /admin/verifications`

Role access: ADMIN.

Returns:

- Pending trainer and dietitian profiles.

### `approveVerificationAction`

Role access: ADMIN.

Input:

- profileType: TRAINER or DIETITIAN
- profileId
- note optional

Output:

- Verification status APPROVED.
- verifiedAt set.

### `rejectVerificationAction`

Role access: ADMIN.

Input:

- profileType
- profileId
- note required or optional

Output:

- Verification status REJECTED.
- note saved.

## Consultations

### `createConsultationRequestAction`

Role access: authenticated.

Input:

- targetType: TRAINER or DIETITIAN
- targetProfileId
- topic
- message

Output:

- Consultation request.
- Optional conversation.

Rules:

- Target professional must exist.
- Public listing should normally show only approved professionals.

### `updateConsultationStatusAction`

Role access:

- Target professional owner.
- ADMIN.

Input:

- requestId
- status

Output:

- Updated status.

## Messaging

### `GET /messages`

Role access: authenticated.

Returns:

- Conversation list for current user.

### `GET /messages/[conversationId]`

Role access: conversation participant or ADMIN.

Returns:

- Conversation participants.
- Message list.

### `sendMessageAction`

Role access: conversation participant.

Input:

- conversationId
- content

Output:

- Created message.
- Revalidates message thread.

## Admin

### `GET /admin`

Role access: ADMIN.

Returns:

- Counts: users, trainers, dietitians, gyms, pending verifications, consultations.

### `GET /admin/users`

Role access: ADMIN.

Returns:

- User table with role and created date.

### `updateUserRoleAction`

Role access: ADMIN.

Input:

- userId
- role

Output:

- Updated role.

Rules:

- Avoid demoting the only admin in MVP, or at minimum show a warning.

