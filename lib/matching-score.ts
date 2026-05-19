export type MatchingScoreInput = {
  distanceKm: number;
  sharedGoalCount: number;
  sharedMuscleGroupCount: number;
  sameFitnessLevel: boolean;
};

export function calculateMatchingScore(input: MatchingScoreInput) {
  const distanceScore = Math.max(0, 40 - input.distanceKm * 4);
  const goalsScore = input.sharedGoalCount * 15;
  const muscleScore = input.sharedMuscleGroupCount * 10;
  const levelScore = input.sameFitnessLevel ? 10 : 0;

  return Math.round(Math.min(100, distanceScore + goalsScore + muscleScore + levelScore));
}
