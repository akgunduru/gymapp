import { WorkoutRecommender } from "@/components/workouts/workout-recommender";
import { requireUser } from "@/lib/auth";
import { getWorkoutRecommendationData } from "@/lib/workout-programs";

export default async function WorkoutsPage() {
  await requireUser();
  const { programs, options } = await getWorkoutRecommendationData();

  return <WorkoutRecommender programs={programs} options={options} />;
}
