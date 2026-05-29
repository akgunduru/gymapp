import nutritionModelTree from "@/data/nutrition_model_tree.json";
import type { NutritionGoal } from "@/lib/nutrition-parser";

export type MlMealCategory =
  | "high_protein"
  | "high_carb"
  | "balanced"
  | "high_fat"
  | "fat_loss_friendly"
  | "muscle_gain_friendly";

export type GoalCompatibilityLabel = "Excellent" | "Good" | "Moderate" | "Low";

export type NutritionMlPrediction = {
  mealCategory: MlMealCategory;
  mealCategoryLabel: string;
  confidence: number;
  healthScore: number;
  goalCompatibility: {
    label: GoalCompatibilityLabel;
    score: number;
  };
  badges: string[];
  explanation: string;
  modelAccuracy: number;
  foodsCount: number;
};

type MlFeatureName =
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "protein_ratio"
  | "carb_ratio"
  | "fat_ratio";

type NutritionFeatureVector = Record<MlFeatureName, number>;

type TreeNode =
  | {
      id: number;
      isLeaf: false;
      feature: MlFeatureName;
      threshold: number;
      left: number;
      right: number;
      predictedClass: MlMealCategory;
      probability: number;
    }
  | {
      id: number;
      isLeaf: true;
      predictedClass: MlMealCategory;
      probability: number;
      classCounts: Record<MlMealCategory, number>;
    };

type NutritionTreeExport = {
  modelType: "DecisionTreeClassifier";
  featureNames: MlFeatureName[];
  labels: MlMealCategory[];
  labelDisplayNames: Record<MlMealCategory, string>;
  foodsCount: number;
  metrics: {
    accuracy: number;
    trainingSamples: number;
    testSamples: number;
  };
  nodes: TreeNode[];
};

const treeExport = nutritionModelTree as NutritionTreeExport;
const nodeById = new Map(treeExport.nodes.map((node) => [node.id, node]));

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function buildNutritionFeatures(totals: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): NutritionFeatureVector {
  const macroCalories = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  const denominator = Math.max(1, macroCalories);

  return {
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    protein_ratio: (totals.protein * 4) / denominator,
    carb_ratio: (totals.carbs * 4) / denominator,
    fat_ratio: (totals.fat * 9) / denominator,
  };
}

function predictCategory(features: NutritionFeatureVector) {
  let current = nodeById.get(0);

  for (let depth = 0; depth < 32; depth += 1) {
    if (!current) break;
    if (current.isLeaf) {
      return {
        category: current.predictedClass,
        confidence: Math.round(current.probability * 100),
      };
    }

    current = nodeById.get(features[current.feature] <= current.threshold ? current.left : current.right);
  }

  return {
    category: fallbackCategory(features),
    confidence: 55,
  };
}

function fallbackCategory(features: NutritionFeatureVector): MlMealCategory {
  if (features.protein >= 30 && features.carbs >= 35 && features.calories >= 450) {
    return "muscle_gain_friendly";
  }
  if (features.protein >= 24 && features.calories <= 650 && features.fat <= 24) {
    return "fat_loss_friendly";
  }
  if (features.protein >= 32 || features.protein_ratio >= 0.32) return "high_protein";
  if (features.fat >= 28 || features.fat_ratio >= 0.42) return "high_fat";
  if (features.carbs >= 55 || features.carb_ratio >= 0.58) return "high_carb";
  return "balanced";
}

function calculateMlHealthScore(
  category: MlMealCategory,
  features: NutritionFeatureVector,
  goal: NutritionGoal,
) {
  const baseScores: Record<MlMealCategory, number> = {
    fat_loss_friendly: 88,
    muscle_gain_friendly: 86,
    balanced: 80,
    high_protein: 76,
    high_carb: 58,
    high_fat: 52,
  };
  let score = baseScores[category] ?? 65;

  if (features.protein >= 25) score += 5;
  if (features.protein_ratio >= 0.25) score += 4;
  if (features.fat_ratio >= 0.2 && features.fat_ratio <= 0.38) score += 3;
  if (features.calories > 950) score -= 10;
  if (features.fat > 35) score -= 8;
  if (features.carb_ratio > 0.65) score -= 5;

  if (goal === "fat_loss") {
    if (category === "fat_loss_friendly") score += 7;
    if (features.calories > 750) score -= 8;
  } else if (goal === "muscle_gain") {
    if (category === "muscle_gain_friendly") score += 7;
    if (features.protein < 25) score -= 8;
  } else if (category === "balanced") {
    score += 6;
  }

  return clamp(Math.round(score), 5, 100);
}

function calculateGoalCompatibility(
  category: MlMealCategory,
  features: NutritionFeatureVector,
  goal: NutritionGoal,
): NutritionMlPrediction["goalCompatibility"] {
  let score = 62;

  if (goal === "fat_loss") {
    if (category === "fat_loss_friendly") score += 28;
    if (features.protein >= 24) score += 8;
    if (features.calories > 800) score -= 16;
    if (category === "high_fat") score -= 12;
  } else if (goal === "muscle_gain") {
    if (category === "muscle_gain_friendly") score += 28;
    if (features.protein >= 30) score += 10;
    if (features.carbs >= 35) score += 5;
    if (features.protein < 20) score -= 18;
  } else {
    if (category === "balanced") score += 25;
    if (features.fat_ratio <= 0.42 && features.carb_ratio <= 0.62) score += 8;
  }

  const clamped = clamp(Math.round(score), 5, 100);
  const label: GoalCompatibilityLabel =
    clamped >= 85 ? "Excellent" : clamped >= 70 ? "Good" : clamped >= 50 ? "Moderate" : "Low";

  return { label, score: clamped };
}

function badgesForPrediction(
  category: MlMealCategory,
  compatibility: NutritionMlPrediction["goalCompatibility"],
) {
  const badges = [treeExport.labelDisplayNames[category]];

  if (compatibility.score >= 85) badges.push("Strong Goal Match");
  if (category === "high_carb") badges.push("High Carb Warning");
  if (category === "high_fat") badges.push("High Fat Warning");
  if (category === "high_protein" || category === "muscle_gain_friendly") {
    badges.push("Protein Focused");
  }

  return badges;
}

function explanationFor(category: MlMealCategory, compatibility: NutritionMlPrediction["goalCompatibility"]) {
  const label = treeExport.labelDisplayNames[category];
  const compatNote =
    compatibility.score >= 80
      ? "aligns well with your goal"
      : compatibility.score >= 55
      ? "moderately supports your goal"
      : "may need some adjustments to better fit your goal";
  return `This meal is characterized as ${label.toLowerCase()} and ${compatNote}.`;
}

export function predictNutritionMl(
  totals: { calories: number; protein: number; carbs: number; fat: number },
  goal: NutritionGoal,
): NutritionMlPrediction {
  if (totals.calories <= 0) {
    return {
      mealCategory: "balanced",
      mealCategoryLabel: "Awaiting Meal Data",
      confidence: 0,
      healthScore: 0,
      goalCompatibility: { label: "Low", score: 0 },
      badges: [],
      explanation: "Enter a meal description to receive personalized nutrition insights.",
      modelAccuracy: Math.round(treeExport.metrics.accuracy * 100),
      foodsCount: treeExport.foodsCount,
    };
  }

  const features = buildNutritionFeatures(totals);
  const prediction = predictCategory(features);
  const healthScore = calculateMlHealthScore(prediction.category, features, goal);
  const goalCompatibility = calculateGoalCompatibility(prediction.category, features, goal);

  return {
    mealCategory: prediction.category,
    mealCategoryLabel: treeExport.labelDisplayNames[prediction.category],
    confidence: prediction.confidence,
    healthScore,
    goalCompatibility,
    badges: badgesForPrediction(prediction.category, goalCompatibility),
    explanation: explanationFor(prediction.category, goalCompatibility),
    modelAccuracy: Math.round(treeExport.metrics.accuracy * 100),
    foodsCount: treeExport.foodsCount,
  };
}
