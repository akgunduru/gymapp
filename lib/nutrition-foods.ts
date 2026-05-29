import nutritionFoodsData from "@/data/foods.json";

export type NutritionBasis = "PER_100G" | "PER_UNIT";

export type ServingUnit =
  | "gram"
  | "kilogram"
  | "milliliter"
  | "piece"
  | "slice"
  | "cup"
  | "tablespoon"
  | "teaspoon"
  | "bottle"
  | "bowl"
  | "scoop"
  | "can"
  | "serving";

export type FoodTag =
  | "lean_protein"
  | "protein"
  | "carb"
  | "fiber"
  | "fruit"
  | "vegetable"
  | "healthy_fat"
  | "dairy"
  | "processed"
  | "added_sugar"
  | "whole_food";

type FoodNutritionJson = {
  id: string;
  name: string;
  aliases: string[];
  servingType: string;
  unitBasis: "per_100g" | "per_unit";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultServingGrams: number;
  unitGrams?: number;
  unitWeights?: Partial<Record<ServingUnit, number>>;
  tags: FoodTag[];
};

export type FoodNutrition = {
  id: string;
  name: string;
  aliases: string[];
  servingType: string;
  basis: NutritionBasis;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultServingGrams: number;
  unitGrams?: number;
  unitWeights?: Partial<Record<ServingUnit, number>>;
  tags: FoodTag[];
};

type NutritionFoodsPayload = {
  notice: string;
  generatedAt: string;
  foods: FoodNutritionJson[];
};

const payload = nutritionFoodsData as NutritionFoodsPayload;

// Nutrition values are approximate and intended for demo guidance only.
export const NUTRITION_DATASET_NOTICE = payload.notice;

export const FOOD_NUTRITION_DATASET: FoodNutrition[] = payload.foods.map((food) => ({
  id: food.id,
  name: food.name,
  aliases: food.aliases,
  servingType: food.servingType,
  basis: food.unitBasis === "per_unit" ? "PER_UNIT" : "PER_100G",
  calories: food.calories,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
  defaultServingGrams: food.defaultServingGrams,
  unitGrams: food.unitGrams,
  unitWeights: food.unitWeights,
  tags: food.tags,
}));
