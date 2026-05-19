export type MockMealAnalysisInput = {
  fileName: string;
  fileSizeBytes: number;
  description?: string;
};

export type MockMealAnalysisResult = {
  estimatedName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  explanation: string;
};

export function analyzeMealImageMock(input: MockMealAnalysisInput): MockMealAnalysisResult {
  const normalizedName = input.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const baseCalories = 250 + Math.min(500, Math.round(input.fileSizeBytes / 2000));

  return {
    estimatedName: input.description?.trim() || normalizedName || "Meal image",
    calories: baseCalories,
    protein: Math.round(baseCalories * 0.18 / 4),
    carbs: Math.round(baseCalories * 0.48 / 4),
    fat: Math.round(baseCalories * 0.34 / 9),
    confidence: 0.64,
    explanation: "Mock demo estimate based on file metadata and optional description.",
  };
}
