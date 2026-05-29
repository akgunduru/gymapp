export type WorkoutProgram = {
  id: string;
  title: string;
  description: string;
  level: string;
  goal: string;
  equipment: string;
  duration: number;
  programLength: number;
  totalExercises: number;
  recommendedFor: string;
};

export type WorkoutFilterOptions = {
  levels: string[];
  goals: string[];
  equipment: string[];
  durations: number[];
};
