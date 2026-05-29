/**
 * Exercise library — maps (goal × equipment × level) to a representative
 * set of exercises with real YouTube IDs preserved from the original project.
 *
 * YouTube IDs come directly from the Social-Gym-main workouts-dashboard.tsx.
 * Exercises without a specific known ID use `youtubeId: null` — the UI will
 * open a YouTube search URL for those instead of embedding.
 */

/* ── Types ────────────────────────────────────────────────── */
export type ExerciseItem = {
  name: string;
  sets: number;       // adjusted by level at lookup time
  reps: string;
  equipment: string;
  tip: string;
  youtubeId: string | null; // null → open YouTube search in new tab
};

type RawExercise = Omit<ExerciseItem, "sets">;

/* ── Helpers ─────────────────────────────────────────────── */
function setsForLevel(level: string): number {
  if (level === "Beginner") return 3;
  if (level === "Advanced") return 5;
  return 4; // Intermediate
}

export function youtubeSearchUrl(exerciseName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    exerciseName + " exercise tutorial form"
  )}`;
}

/* ── Exercise data per (goal, equipment) ─────────────────── */
// YouTube IDs from Social-Gym-main/components/workouts/workouts-dashboard.tsx
const EXERCISES: Record<string, Record<string, RawExercise[]>> = {

  /* ── MUSCLE GAIN ─────────────────────────────────────── */
  "Muscle Gain": {
    "Full Gym": [
      {
        name: "Barbell Bench Press",
        reps: "8–10",
        equipment: "Barbell & Flat Bench",
        tip: "Retract shoulder blades; lower bar with control, elbows at 45°.",
        youtubeId: "PMYB5nW8GQw",
      },
      {
        name: "Wide Grip Lat Pulldown",
        reps: "10–12",
        equipment: "Cable Station",
        tip: "Pull bar to clavicle; drive elbows down, not back.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Barbell Back Squat",
        reps: "8–10",
        equipment: "Barbell & Squat Rack",
        tip: "Squat until thighs are parallel; push through heels.",
        youtubeId: "2A35vaYyYL4",
      },
      {
        name: "Overhead Barbell Press",
        reps: "8–10",
        equipment: "Barbell",
        tip: "Brace core and keep hips tucked under during the press.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "EZ-Bar Biceps Curl",
        reps: "10–12",
        equipment: "EZ-Bar",
        tip: "Keep elbows pinned to your sides; avoid swinging.",
        youtubeId: "sxA__DoLsgo",
      },
      {
        name: "Triceps Pushdown",
        reps: "12",
        equipment: "Cable Station & Rope",
        tip: "Flare rope out at the bottom for full triceps contraction.",
        youtubeId: "1qQTmGCHKw4",
      },
      {
        name: "Cable Face Pulls",
        reps: "15",
        equipment: "Cable & Rope",
        tip: "Pull to forehead level; elbows wide with external rotation.",
        youtubeId: "_lI23q3Vdvg",
      },
    ],
    "Dumbbells": [
      {
        name: "Dumbbell Flat Bench Press",
        reps: "10–12",
        equipment: "Dumbbells & Flat Bench",
        tip: "Lower dumbbells with control to get a deep chest stretch.",
        youtubeId: "PMYB5nW8GQw",
      },
      {
        name: "Single Arm Dumbbell Row",
        reps: "10–12 each side",
        equipment: "Dumbbell & Bench",
        tip: "Extend arm fully at bottom; pull elbow past hip.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Goblet Squat",
        reps: "12",
        equipment: "Dumbbell / Kettlebell",
        tip: "Hold weight close to chest; deep squat with a flat back.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Dumbbell Shoulder Press",
        reps: "10–12",
        equipment: "Dumbbells",
        tip: "Keep elbows slightly in front — not fully flared — to protect the joint.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Hammer Curl",
        reps: "10–12",
        equipment: "Dumbbells",
        tip: "Neutral grip (palms facing in) targets brachialis and forearms.",
        youtubeId: "5S8x-9SvQ5w",
      },
      {
        name: "Bench Dips",
        reps: "12–15",
        equipment: "Bench",
        tip: "Keep back close to bench; don't let elbows flare out.",
        youtubeId: "svcEnaF1WJY",
      },
      {
        name: "Romanian Deadlift",
        reps: "10–12",
        equipment: "Dumbbells",
        tip: "Hinge at hips with a neutral spine; feel the hamstring stretch.",
        youtubeId: "Rg27bvMeTKA",
      },
    ],
    "Bodyweight": [
      {
        name: "Wide Grip Pull-ups",
        reps: "Max reps",
        equipment: "Pull-up Bar",
        tip: "Drive chest toward bar; full hang at the bottom each rep.",
        youtubeId: "5HxMcpoPYIw",
      },
      {
        name: "Push-ups",
        reps: "15–20",
        equipment: "Bodyweight",
        tip: "Maintain a straight body line; lower chest just above the floor.",
        youtubeId: null,
      },
      {
        name: "Bodyweight Squat",
        reps: "15–20",
        equipment: "Bodyweight",
        tip: "Keep chest up and knees aligned with toes throughout.",
        youtubeId: null,
      },
      {
        name: "Plank Hold",
        reps: "45–60 s",
        equipment: "Mat",
        tip: "Squeeze glutes and core; avoid letting hips sag or rise.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Bench Dips",
        reps: "12–15",
        equipment: "Bench / Chair",
        tip: "Elbows point back; lower until 90° elbow bend.",
        youtubeId: "svcEnaF1WJY",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "8–12",
        equipment: "Ab Wheel",
        tip: "Brace core hard before moving; don't let lower back collapse.",
        youtubeId: "MinlHnG7j4k",
      },
    ],
    "At Home": [
      {
        name: "Dumbbell Flat Bench Press",
        reps: "10–12",
        equipment: "Dumbbells & Flat Surface",
        tip: "Control the descent; focus on chest contraction at the top.",
        youtubeId: "PMYB5nW8GQw",
      },
      {
        name: "Goblet Squat",
        reps: "12",
        equipment: "Dumbbell / Kettlebell",
        tip: "Hold weight at chest height; squat deep with an upright torso.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Single Arm Dumbbell Row",
        reps: "10–12 each side",
        equipment: "Dumbbell",
        tip: "Brace the free hand; pull elbow past hip for full range.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Hammer Curl",
        reps: "10–12",
        equipment: "Dumbbells",
        tip: "Neutral grip maximises brachialis activation alongside biceps.",
        youtubeId: "5S8x-9SvQ5w",
      },
      {
        name: "Bench Dips",
        reps: "12–15",
        equipment: "Sturdy Chair / Bench",
        tip: "Keep hips close to the surface; go to 90° elbow bend.",
        youtubeId: "svcEnaF1WJY",
      },
      {
        name: "Plank Hold",
        reps: "45–60 s",
        equipment: "Mat",
        tip: "Neutral spine, tight core and glutes; breathe steadily.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
  },

  /* ── STRENGTH ────────────────────────────────────────── */
  "Strength": {
    "Full Gym": [
      {
        name: "Barbell Back Squat",
        reps: "4–6 (heavy)",
        equipment: "Barbell & Squat Rack",
        tip: "Brace core hard; maintain neutral spine; drive up through heels.",
        youtubeId: "2A35vaYyYL4",
      },
      {
        name: "Barbell Bench Press",
        reps: "4–6 (heavy)",
        equipment: "Barbell & Flat Bench",
        tip: "Arch slightly, retract scapulae; lower bar to lower chest.",
        youtubeId: "PMYB5nW8GQw",
      },
      {
        name: "Overhead Barbell Press",
        reps: "5–6",
        equipment: "Barbell",
        tip: "Squeeze glutes and abs; press bar in a vertical path.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Romanian Deadlift",
        reps: "5–6",
        equipment: "Barbell",
        tip: "Push hips back; bar stays close to legs throughout.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Wide Grip Lat Pulldown",
        reps: "6–8",
        equipment: "Cable Station",
        tip: "Lean back slightly; drive elbows down toward pockets.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Bent Over Barbell Row",
        reps: "5–6",
        equipment: "Barbell",
        tip: "45° torso angle; pull bar to lower abdomen for back thickness.",
        youtubeId: "4npLRDcVtgk",
      },
    ],
    "Dumbbells": [
      {
        name: "Romanian Deadlift",
        reps: "6–8",
        equipment: "Dumbbells",
        tip: "Hinge at hips; keep dumbbells close to legs; squeeze glutes at the top.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Dumbbell Flat Bench Press",
        reps: "6–8",
        equipment: "Dumbbells & Bench",
        tip: "Slowly lower dumbbells to deeply stretch pectorals.",
        youtubeId: "PMYB5nW8GQw",
      },
      {
        name: "Single Arm Dumbbell Row",
        reps: "6–8 each side",
        equipment: "Dumbbell & Bench",
        tip: "Pull with your back, not your arm; elbow drives past hip.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Goblet Squat",
        reps: "8–10",
        equipment: "Heavy Dumbbell",
        tip: "Use heavier weight to develop functional lower body strength.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Dumbbell Shoulder Press",
        reps: "6–8",
        equipment: "Dumbbells",
        tip: "Press vertically; avoid overextending elbows at the top.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Concentration Curl",
        reps: "8–10 each arm",
        equipment: "Dumbbell & Bench",
        tip: "Brace elbow on inner thigh; curl with pure bicep force.",
        youtubeId: "i2theb8jGjg",
      },
    ],
    "Bodyweight": [
      {
        name: "Wide Grip Pull-ups",
        reps: "Max reps (add weight if easy)",
        equipment: "Pull-up Bar",
        tip: "Full hang to full contraction; retract shoulder blades at the top.",
        youtubeId: "5HxMcpoPYIw",
      },
      {
        name: "Bench Dips",
        reps: "Max reps (add weight if easy)",
        equipment: "Dip Bars / Bench",
        tip: "Lean forward for chest focus; upright for triceps isolation.",
        youtubeId: "svcEnaF1WJY",
      },
      {
        name: "Bulgarian Split Squat",
        reps: "8–10 each leg",
        equipment: "Bench / Elevated Surface",
        tip: "Keep front shin vertical; lower knee straight down.",
        youtubeId: "vjK_B7tP0BE",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "8–12",
        equipment: "Ab Wheel",
        tip: "Engage core before moving; stop if lower back starts to arch.",
        youtubeId: "MinlHnG7j4k",
      },
      {
        name: "Hanging Leg Raise",
        reps: "10–15",
        equipment: "Pull-up Bar",
        tip: "Control leg movement; raise using core, not momentum.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Plank Hold",
        reps: "60–90 s",
        equipment: "Mat",
        tip: "Think 'push the floor away'; keep hips aligned with shoulders.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "At Home": [
      {
        name: "Goblet Squat",
        reps: "8–10",
        equipment: "Heavy Dumbbell / Kettlebell",
        tip: "Use a challenging weight; control the descent slowly.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Romanian Deadlift",
        reps: "6–8",
        equipment: "Dumbbells",
        tip: "Flat back; feel a strong hamstring stretch at the bottom.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Wide Grip Pull-ups",
        reps: "Max reps",
        equipment: "Pull-up Bar / Doorframe Bar",
        tip: "Slow negatives (3 s down) for maximum strength development.",
        youtubeId: "5HxMcpoPYIw",
      },
      {
        name: "Bench Dips",
        reps: "Max reps",
        equipment: "Chair / Bench",
        tip: "Place weight on lap for progressive overload.",
        youtubeId: "svcEnaF1WJY",
      },
      {
        name: "Dumbbell Shoulder Press",
        reps: "6–8",
        equipment: "Dumbbells",
        tip: "Seated version reduces lower-back stress during heavy sets.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Plank Hold",
        reps: "60–90 s",
        equipment: "Mat",
        tip: "Concentrate on core tension; don't hold your breath.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
  },

  /* ── FAT LOSS ────────────────────────────────────────── */
  "Fat Loss": {
    "Full Gym": [
      {
        name: "Goblet Squat",
        reps: "12–15",
        equipment: "Dumbbell / Kettlebell",
        tip: "Higher rep range maximises calorie burn per set.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Leg Press",
        reps: "12–15",
        equipment: "Leg Press Machine",
        tip: "Keep feet shoulder-width; don't lock knees at the top.",
        youtubeId: "7dVi5y4yCdY",
      },
      {
        name: "Lying Leg Curl",
        reps: "12–15",
        equipment: "Leg Curl Machine",
        tip: "3-second negative phase for deeper hamstring engagement.",
        youtubeId: "n5WDXD_mpVY",
      },
      {
        name: "Leg Extension",
        reps: "12–15",
        equipment: "Leg Extension Machine",
        tip: "Squeeze quads at the top for 1 second; lower slowly.",
        youtubeId: "_h6lHeSE04s",
      },
      {
        name: "Cable Crunch",
        reps: "15–20",
        equipment: "Cable Station",
        tip: "Keep hips fixed; contract abs, not hip flexors.",
        youtubeId: "K2m0jj6RfYg",
      },
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Superb core stabiliser that costs meaningful metabolic energy.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Standing Calf Raise",
        reps: "15–20",
        equipment: "Calf Block / Machine",
        tip: "Full stretch at the bottom; rise fully onto toes at the top.",
        youtubeId: "QZ9TMPDnAzs",
      },
    ],
    "Dumbbells": [
      {
        name: "Goblet Squat",
        reps: "15",
        equipment: "Dumbbell",
        tip: "Short rest between sets keeps heart rate elevated.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Romanian Deadlift",
        reps: "12–15",
        equipment: "Dumbbells",
        tip: "Feel the hamstring stretch; consistent controlled pace.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Dumbbell Walking Lunges",
        reps: "12 each leg",
        equipment: "Dumbbells",
        tip: "Front knee stays behind toes; maintain an upright torso.",
        youtubeId: "2C-uNgKwPLE",
      },
      {
        name: "Dumbbell Shoulder Press",
        reps: "12–15",
        equipment: "Dumbbells",
        tip: "Moderate weight with short rest periods for metabolic effect.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Hammer Curl",
        reps: "12–15",
        equipment: "Dumbbells",
        tip: "Superset with shoulder press to increase workout density.",
        youtubeId: "5S8x-9SvQ5w",
      },
      {
        name: "Plank Hold",
        reps: "45–60 s",
        equipment: "Mat",
        tip: "Core stability burn is valuable in any fat-loss circuit.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "Bodyweight": [
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Full body tension; squeeze every muscle group simultaneously.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Hanging Leg Raise",
        reps: "12–15",
        equipment: "Pull-up Bar",
        tip: "Keep legs straight for maximum abs and hip flexor activation.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Russian Twists",
        reps: "20 each side",
        equipment: "Mat",
        tip: "Lean back slightly; twist from the obliques, not the arms.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Decline Sit-up",
        reps: "15",
        equipment: "Decline Bench / Mat",
        tip: "Exhale sharply at the top to maximally contract abs.",
        youtubeId: "DAnTf16NcT0",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "10–12",
        equipment: "Ab Wheel",
        tip: "Slow and controlled; pause at full extension briefly.",
        youtubeId: "MinlHnG7j4k",
      },
      {
        name: "Side Plank",
        reps: "45 s each side",
        equipment: "Mat",
        tip: "Keep hips lifted; don't let them sag toward the floor.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "At Home": [
      {
        name: "Goblet Squat",
        reps: "15",
        equipment: "Dumbbell / Household Weight",
        tip: "Higher reps and shorter rest = greater calorie expenditure.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Dumbbell Walking Lunges",
        reps: "12 each leg",
        equipment: "Dumbbells",
        tip: "Alternate legs in a controlled walking pattern.",
        youtubeId: "2C-uNgKwPLE",
      },
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Excellent calorie-burning stabilisation exercise.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Russian Twists",
        reps: "20 each side",
        equipment: "Mat",
        tip: "Add a dumbbell for extra resistance and oblique activation.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Hanging Leg Raise",
        reps: "12–15",
        equipment: "Pull-up Bar",
        tip: "Slow and controlled; avoid using swinging momentum.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "10–12",
        equipment: "Ab Wheel",
        tip: "Core must stay rigid; protect the lumbar spine throughout.",
        youtubeId: "MinlHnG7j4k",
      },
    ],
  },

  /* ── CONDITIONING ────────────────────────────────────── */
  "Conditioning": {
    "Full Gym": [
      {
        name: "Goblet Squat",
        reps: "15–20",
        equipment: "Dumbbell / Kettlebell",
        tip: "Minimal rest; keep moving for conditioning stimulus.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Wide Grip Lat Pulldown",
        reps: "15",
        equipment: "Cable Station",
        tip: "Controlled tempo keeps muscles under tension during circuits.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Leg Press",
        reps: "15–20",
        equipment: "Leg Press Machine",
        tip: "Higher volume leg work delivers strong cardiovascular conditioning.",
        youtubeId: "7dVi5y4yCdY",
      },
      {
        name: "Cable Crunch",
        reps: "15–20",
        equipment: "Cable Station",
        tip: "Focus on core engagement; breathe out powerfully at the top.",
        youtubeId: "K2m0jj6RfYg",
      },
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Works as active rest between heavier lifts in circuit training.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Lying Leg Curl",
        reps: "15",
        equipment: "Leg Curl Machine",
        tip: "Control the descent for hamstring conditioning.",
        youtubeId: "n5WDXD_mpVY",
      },
      {
        name: "Standing Calf Raise",
        reps: "20",
        equipment: "Calf Raise Machine",
        tip: "Fast-paced to raise heart rate and hit fast-twitch calf fibres.",
        youtubeId: "QZ9TMPDnAzs",
      },
    ],
    "Bodyweight": [
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Maintain tension head to toe; breathe in through the nose.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Hanging Leg Raise",
        reps: "12–15",
        equipment: "Pull-up Bar",
        tip: "Use as a conditioning finisher with minimal rest between sets.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Russian Twists",
        reps: "20 each side",
        equipment: "Mat",
        tip: "Keep feet off the floor to increase difficulty and endurance.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Side Plank",
        reps: "45 s each side",
        equipment: "Mat",
        tip: "Rotate to full plank between left and right for variety.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "10–15",
        equipment: "Ab Wheel",
        tip: "Pause at full extension for an extra conditioning challenge.",
        youtubeId: "MinlHnG7j4k",
      },
      {
        name: "Decline Sit-up",
        reps: "15–20",
        equipment: "Decline Bench / Mat",
        tip: "Combine with plank holds for a high-density core circuit.",
        youtubeId: "DAnTf16NcT0",
      },
    ],
    "Dumbbells": [
      {
        name: "Goblet Squat",
        reps: "15–20",
        equipment: "Dumbbell",
        tip: "Moderate weight with short rest — keep conditioning intensity high.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Dumbbell Walking Lunges",
        reps: "12 each leg",
        equipment: "Dumbbells",
        tip: "Compound movement; excellent for metabolic conditioning.",
        youtubeId: "2C-uNgKwPLE",
      },
      {
        name: "Dumbbell Shoulder Press",
        reps: "15",
        equipment: "Dumbbells",
        tip: "Short rest periods create a cardiovascular effect.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Romanian Deadlift",
        reps: "15",
        equipment: "Dumbbells",
        tip: "Higher rep RDL builds posterior chain endurance.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Hammer Curl",
        reps: "15",
        equipment: "Dumbbells",
        tip: "Superset with RDL for a full-body conditioning blast.",
        youtubeId: "5S8x-9SvQ5w",
      },
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Use plank as active recovery between dumbbell sets.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "At Home": [
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Foundation of any home conditioning circuit.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Side Plank",
        reps: "45 s each side",
        equipment: "Mat",
        tip: "Targets lateral core stability; keep hips high throughout.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Hanging Leg Raise",
        reps: "12–15",
        equipment: "Pull-up Bar / Doorframe",
        tip: "Control leg movement; avoid using momentum.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Russian Twists",
        reps: "20 each side",
        equipment: "Mat",
        tip: "Add a water bottle or dumbbell for extra resistance.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "10–15",
        equipment: "Ab Wheel",
        tip: "Full-body conditioning movement; tight core throughout.",
        youtubeId: "MinlHnG7j4k",
      },
      {
        name: "Decline Sit-up",
        reps: "15–20",
        equipment: "Mat / Incline",
        tip: "Exhale hard at the top to increase calorie burn.",
        youtubeId: "DAnTf16NcT0",
      },
    ],
  },

  /* ── MOBILITY ────────────────────────────────────────── */
  "Mobility": {
    "Full Gym": [
      {
        name: "Goblet Squat (Deep Pause)",
        reps: "10–12 slow + 3 s pause",
        equipment: "Light Dumbbell",
        tip: "Pause at the bottom; focus on hip opening and ankle mobility.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Romanian Deadlift (Hamstring Focus)",
        reps: "10–12 slow",
        equipment: "Light Barbell",
        tip: "Maximise hip hinge range; feel hamstring lengthening throughout.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Plank Hold",
        reps: "60–90 s",
        equipment: "Mat",
        tip: "Mobility requires stability; plank builds functional core control.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Cable Face Pulls",
        reps: "15–20",
        equipment: "Cable & Rope",
        tip: "Excellent for shoulder external rotation and upper back mobility.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Wide Grip Lat Pulldown (Light)",
        reps: "12–15 controlled",
        equipment: "Cable Station",
        tip: "Slow eccentric phase to improve shoulder and lat mobility.",
        youtubeId: "4npLRDcVtgk",
      },
      {
        name: "Side Plank",
        reps: "45–60 s each side",
        equipment: "Mat",
        tip: "Lateral stability is a core component of overall mobility.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "Bodyweight": [
      {
        name: "Plank Hold",
        reps: "60–90 s",
        equipment: "Mat",
        tip: "Focus on breathing; a relaxed plank teaches active mobility.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Side Plank",
        reps: "45–60 s each side",
        equipment: "Mat",
        tip: "Stagger or stack feet; maintain a straight body line.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Ab Wheel Rollout (Slow)",
        reps: "8–12 slow",
        equipment: "Ab Wheel",
        tip: "Controlled rollout opens up the lumbar and thoracic spine.",
        youtubeId: "MinlHnG7j4k",
      },
      {
        name: "Goblet Squat (Deep Hold)",
        reps: "10 + 5 s hold at bottom",
        equipment: "Bodyweight",
        tip: "Prying goblet squat is one of the best hip flexor and ankle mobility drills.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Russian Twists (Slow)",
        reps: "10 each side, slow",
        equipment: "Mat",
        tip: "Slow thoracic rotation improves spinal mobility over time.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Hanging Leg Raise (Slow)",
        reps: "8–10 slow",
        equipment: "Pull-up Bar",
        tip: "Controlled movement decompresses the spine and builds hip flexor range.",
        youtubeId: "QBbn061riE8",
      },
    ],
    "Dumbbells": [
      {
        name: "Romanian Deadlift (Slow)",
        reps: "10–12 slow",
        equipment: "Light Dumbbells",
        tip: "Focus on hamstring lengthening, not weight.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Goblet Squat (Deep)",
        reps: "10 + 5 s hold at bottom",
        equipment: "Light Dumbbell",
        tip: "The pause at the bottom is where the mobility work happens.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Dumbbell Shoulder Press (Light)",
        reps: "12–15 slow",
        equipment: "Light Dumbbells",
        tip: "Use light weight to work overhead shoulder mobility safely.",
        youtubeId: "_lI23q3Vdvg",
      },
      {
        name: "Dumbbell Walking Lunges",
        reps: "10 each leg, slow",
        equipment: "Light Dumbbells",
        tip: "Long stride and deep lunge for hip flexor and glute mobility.",
        youtubeId: "2C-uNgKwPLE",
      },
      {
        name: "Plank Hold",
        reps: "60 s",
        equipment: "Mat",
        tip: "Core stability supports and enhances mobility work.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Side Plank",
        reps: "45 s each side",
        equipment: "Mat",
        tip: "Lateral stability is key for safe mobility development.",
        youtubeId: "pSHjTRCQxIw",
      },
    ],
    "At Home": [
      {
        name: "Plank Hold",
        reps: "60–90 s",
        equipment: "Mat",
        tip: "Core stability is the foundation of movement quality.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Side Plank",
        reps: "45–60 s each side",
        equipment: "Mat",
        tip: "Lateral chain activation helps prevent injury during mobility training.",
        youtubeId: "pSHjTRCQxIw",
      },
      {
        name: "Goblet Squat (Deep Hold)",
        reps: "10 + 5 s pause",
        equipment: "Dumbbell / Household Weight",
        tip: "Deep squat prying is one of the best hip mobility drills available.",
        youtubeId: "tHtyQ56AxKI",
      },
      {
        name: "Romanian Deadlift (Slow)",
        reps: "10–12 slow",
        equipment: "Dumbbells / Resistance Band",
        tip: "Maximise hamstring and hip hinge range of motion.",
        youtubeId: "Rg27bvMeTKA",
      },
      {
        name: "Russian Twists",
        reps: "10 each side, slow",
        equipment: "Mat",
        tip: "Thoracic rotation — don't rush; mobility needs time under tension.",
        youtubeId: "QBbn061riE8",
      },
      {
        name: "Ab Wheel Rollout",
        reps: "8–10 slow",
        equipment: "Ab Wheel",
        tip: "If no wheel, use hands on a towel on a smooth floor.",
        youtubeId: "MinlHnG7j4k",
      },
    ],
  },
};

/* ── Public lookup function ──────────────────────────────── */
/**
 * Returns a representative set of exercises for the given program parameters.
 * Sets are adjusted by level: Beginner = 3, Intermediate = 4, Advanced = 5.
 */
export function getExercisesForProgram(
  goal: string,
  equipment: string,
  level: string
): ExerciseItem[] {
  const goalMap = EXERCISES[goal] ?? EXERCISES["Muscle Gain"];
  // Fallback to first available equipment variant if exact match not found
  const raw: RawExercise[] =
    goalMap[equipment] ?? goalMap[Object.keys(goalMap)[0]] ?? [];
  const sets = setsForLevel(level);
  return raw.map((ex) => ({ ...ex, sets }));
}
