# UI Screen Flow

## Navigation Model

Authenticated users see a shared app shell:

- Sidebar or top navigation depending on viewport.
- Main navigation: Dashboard, Profile, Gyms, Buddies, Workouts, Nutrition, Professionals, Consultations, Messages.
- Admin-only navigation item: Admin.
- Professional users see an additional professional profile/status area.

Unauthenticated users only see login/register screens.

## Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Credentials login |
| `/register` | Public | Create USER/TRAINER/DIETITIAN account |
| `/dashboard` | Authenticated | Personalized summary |
| `/profile` | Authenticated | Profile and fitness preferences |
| `/gyms` | Authenticated | Gym discovery and map |
| `/buddies` | Authenticated | Buddy matching |
| `/workouts` | Authenticated | Workout recommendations |
| `/nutrition` | Authenticated | Meal tracking and mock AI upload |
| `/professionals` | Authenticated | Trainer/dietitian discovery |
| `/professionals/[id]` | Authenticated | Public professional detail |
| `/consultations` | Authenticated | Requests sent/received |
| `/messages` | Authenticated | Conversation list |
| `/messages/[conversationId]` | Participant or ADMIN | Message thread |
| `/admin` | ADMIN | Admin dashboard |
| `/admin/verifications` | ADMIN | Professional verification queue |
| `/admin/users` | ADMIN | User management |

## Authentication Flow

```txt
Visitor
  -> Register or Login
  -> Session created
  -> Dashboard
  -> Complete profile prompt if profile is incomplete
```

Registration flow:

1. User chooses role: USER, TRAINER, or DIETITIAN.
2. User enters full name, email, password.
3. System creates User and Profile.
4. If role is TRAINER or DIETITIAN, user is guided to professional profile setup.

## Dashboard

Purpose: quick entry point into the system.

Recommended cards:

- Today's calories and macros.
- Suggested workout based on preferences.
- Nearby gyms.
- Top buddy matches.
- Consultation request status.
- Professional verification status for trainer/dietitian users.

## Profile Screen

Sections:

- Basic identity: full name, bio, city.
- Location: latitude/longitude inputs or browser geolocation button.
- Fitness preferences: level, goals, preferred muscle groups.
- Nutrition goals: calories, protein, carbs, fat.
- Save button.

Professional users also see:

- Trainer or dietitian profile summary.
- Certificate upload.
- Verification status.

## Gym Discovery Screen

Layout:

- Search/filter bar.
- Map with gym markers.
- Gym cards beside or below map.
- Selected gym detail panel.

Gym detail should show:

- Name, rating, address/city.
- Amenities.
- Trainers associated with the gym.
- Button to view trainer profile or send message/request.

## Buddy Matching Screen

Layout:

- Filter controls: muscle group, level, max distance.
- Ranked buddy cards.
- Compatibility indicators.
- Actions: view profile, message.

Buddy card content:

- Full name.
- Fitness level.
- City/distance.
- Shared goals.
- Shared muscle groups.

Empty state:

- Prompt user to complete profile preferences.

## Workout Recommendations Screen

Layout:

- Muscle group selector.
- Fitness level selector.
- Recommended workout plan.
- Exercise list with sets, reps, notes.

MVP behavior:

- If user has preferences, preselect them.
- If no exact match exists, show nearby alternatives.

## Nutrition Screen

Layout:

- Daily summary: calories, protein, carbs, fat.
- Meal entry form.
- Meal image upload form.
- Mock AI result preview.
- Today's meal list.

Mock AI upload flow:

1. User selects image.
2. User optionally writes a description.
3. System uploads image locally.
4. Mock analyzer returns calories/macros.
5. User confirms or edits values.
6. Meal entry is saved.

## Professionals Screen

Tabs or segmented control:

- Trainers.
- Dietitians.

Filters:

- City.
- Specialty/expertise.
- Verification status should be implicit: public listing shows approved profiles first or only approved profiles.

Professional card:

- Name.
- Role.
- Expertise/specialties.
- Experience years.
- Verification badge.
- Actions: request consultation, message.

## Consultation Flow

```txt
User opens professional profile
  -> Request consultation
  -> Fill topic and message
  -> Request status PENDING
  -> Professional accepts or rejects
  -> Conversation continues through messages
```

Professional consultation view:

- Incoming requests.
- Requester info.
- Topic/message.
- Accept/reject buttons.

User consultation view:

- Sent requests.
- Current status.
- Link to conversation if accepted or created.

## Messaging Screen

Conversation list:

- Participant name.
- Last message.
- Last update time.

Thread:

- Message history.
- Text input.
- Send button.

MVP does not need real-time updates. Page refresh or revalidation is acceptable.

## Admin Panel

Admin dashboard cards:

- Total users.
- Trainers.
- Dietitians.
- Pending verifications.
- Open consultations.
- Meal entries count.

Verification queue:

- Professional name.
- Role.
- Certificate link.
- Expertise/specialties.
- Approve/reject controls.
- Admin note field.

User management:

- Search users.
- View role and created date.
- Optional role change.

## Responsive Behavior

- Desktop: sidebar navigation and two-column layouts where useful.
- Tablet/mobile: top navigation or drawer, stacked cards, full-width forms.
- Map height should be fixed enough to avoid layout jumps.
- Tables should become cards or horizontally scroll on small screens.

