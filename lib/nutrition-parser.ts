import {
  FOOD_NUTRITION_DATASET,
  type FoodNutrition,
  type FoodTag,
  type ServingUnit,
} from "@/lib/nutrition-foods";
import { predictNutritionMl, type NutritionMlPrediction } from "@/lib/nutrition-ml";

export type NutritionGoal = "fat_loss" | "muscle_gain" | "healthy_lifestyle";

export type DetectedFood = {
  id: string;
  name: string;
  matchedText: string;
  quantity: number;
  unit: ServingUnit | "serving";
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  servingDescription: string;
  tags: FoodTag[];
};

export type MealAnalysisResult = {
  input: string;
  goal: NutritionGoal;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  healthScore: number;
  mlPrediction: NutritionMlPrediction;
  detectedFoods: DetectedFood[];
  unknownFoods: string[];
  flags: string[];
  advice: string[];
  betterAlternative: string;
};

type FoodMention = {
  food: FoodNutrition;
  alias: string;
  start: number;
  end: number;
  confidence: number;
  fuzzySegment?: string;
};

const UNIT_ALIASES: Record<string, ServingUnit> = {
  g: "gram",
  gr: "gram",
  gram: "gram",
  grams: "gram",
  kg: "kilogram",
  kilogram: "kilogram",
  kilograms: "kilogram",
  ml: "milliliter",
  milliliter: "milliliter",
  milliliters: "milliliter",
  piece: "piece",
  pieces: "piece",
  unit: "piece",
  units: "piece",
  slice: "slice",
  slices: "slice",
  cup: "cup",
  cups: "cup",
  spoon: "tablespoon",
  spoons: "tablespoon",
  tablespoon: "tablespoon",
  tablespoons: "tablespoon",
  tbsp: "tablespoon",
  teaspoon: "teaspoon",
  teaspoons: "teaspoon",
  tsp: "teaspoon",
  bottle: "bottle",
  bottles: "bottle",
  bowl: "bowl",
  bowls: "bowl",
  scoop: "scoop",
  scoops: "scoop",
  can: "can",
  cans: "can",
  serving: "serving",
  servings: "serving",
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
};

const FILLER_WORDS = new Set([
  "of",
  "with",
  "and",
  "plus",
  "some",
  "a",
  "an",
  "the",
  "meal",
  "plate",
  "serving",
]);

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/\b(and|with|plus)\b/g, ",")
    .replace(/[;\n]+/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForMatch(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularize)
    .join(" ");
}

function singularize(token: string) {
  if (token.length <= 3) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("ses")) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function pluralizePhrase(phrase: string) {
  const parts = phrase.split(" ");
  const last = parts[parts.length - 1];
  if (!last || last.endsWith("s")) return phrase;
  const pluralLast = last.endsWith("y") ? `${last.slice(0, -1)}ies` : `${last}s`;
  return [...parts.slice(0, -1), pluralLast].join(" ");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAliasEntries() {
  return FOOD_NUTRITION_DATASET.flatMap((food) => {
    const aliases = new Set([food.name, ...food.aliases]);
    for (const alias of [...aliases]) {
      aliases.add(pluralizePhrase(alias.toLowerCase()));
    }

    return [...aliases].map((alias) => ({
      food,
      alias: normalizeText(alias),
    }));
  }).sort((a, b) => b.alias.length - a.alias.length);
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function findExactFoodMentions(normalizedInput: string) {
  const mentions: FoodMention[] = [];

  for (const entry of buildAliasEntries()) {
    if (!entry.alias) continue;

    const pattern = new RegExp(`\\b${escapeRegex(entry.alias).replace(/\\s+/g, "\\s+")}\\b`, "g");
    for (const match of normalizedInput.matchAll(pattern)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      const overlaps = mentions.some((mention) =>
        rangesOverlap(start, end, mention.start, mention.end),
      );

      if (overlaps) continue;

      mentions.push({
        food: entry.food,
        alias: match[0],
        start,
        end,
        confidence: entry.alias === normalizeText(entry.food.name) ? 0.96 : 0.93,
      });
    }
  }

  return mentions.sort((a, b) => a.start - b.start);
}

function splitSegments(normalizedInput: string) {
  return normalizedInput
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function cleanSegment(segment: string) {
  return segment
    .replace(/\b\d+(?:[.,]\d+)?\s*(g|gr|gram|grams|kg|ml|cup|cups|slice|slices|piece|pieces|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|bottle|bottles|bowl|bowls|scoop|scoops|can|cans|serving|servings)?\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && !FILLER_WORDS.has(token))
    .join(" ")
    .trim();
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a: string, b: string) {
  const left = normalizeForMatch(a);
  const right = normalizeForMatch(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.9;

  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function findFuzzyMatch(segment: string, existingFoodIds: Set<string>) {
  const cleaned = cleanSegment(segment);
  if (!cleaned) return null;

  let best: { food: FoodNutrition; alias: string; score: number } | null = null;

  for (const food of FOOD_NUTRITION_DATASET) {
    if (existingFoodIds.has(food.id)) continue;

    for (const alias of [food.name, ...food.aliases]) {
      const score = similarity(cleaned, alias);
      if (!best || score > best.score) {
        best = { food, alias, score };
      }
    }
  }

  if (!best || best.score < 0.72) return null;
  return best;
}

function addFuzzyMentions(normalizedInput: string, exactMentions: FoodMention[]) {
  const mentions = [...exactMentions];
  const existingFoodIds = new Set(mentions.map((mention) => mention.food.id));
  const segments = splitSegments(normalizedInput);
  let syntheticStart = normalizedInput.length + 1;

  for (const segment of segments) {
    const segmentStart = normalizedInput.indexOf(segment);
    const segmentEnd = segmentStart + segment.length;
    const hasExactMatch = mentions.some((mention) =>
      rangesOverlap(segmentStart, segmentEnd, mention.start, mention.end),
    );

    if (hasExactMatch) continue;

    const fuzzy = findFuzzyMatch(segment, existingFoodIds);
    if (!fuzzy) continue;

    mentions.push({
      food: fuzzy.food,
      alias: fuzzy.alias,
      start: syntheticStart,
      end: syntheticStart + fuzzy.alias.length,
      confidence: Math.min(0.82, Math.max(0.62, fuzzy.score)),
      fuzzySegment: segment,
    });
    syntheticStart += fuzzy.alias.length + 1;
    existingFoodIds.add(fuzzy.food.id);
  }

  return mentions.sort((a, b) => a.start - b.start);
}

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(",", ".");
  if (NUMBER_WORDS[normalized] !== undefined) return NUMBER_WORDS[normalized];

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractQuantity(prefix: string, food: FoodNutrition): { quantity: number; unit: ServingUnit } {
  const normalizedPrefix = normalizeText(prefix);
  const unitPattern = Object.keys(UNIT_ALIASES).join("|");
  const numberPattern = "(\\d+(?:[.,]\\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half)";
  const unitMatches = [...normalizedPrefix.matchAll(new RegExp(`${numberPattern}\\s*(${unitPattern})\\b`, "g"))];

  if (unitMatches.length > 0) {
    const last = unitMatches[unitMatches.length - 1];
    return {
      quantity: parseNumber(last[1]) ?? 1,
      unit: UNIT_ALIASES[last[2]] ?? "serving",
    };
  }

  const numericMatches = [...normalizedPrefix.matchAll(new RegExp(`${numberPattern}\\s*$`, "g"))];
  if (numericMatches.length > 0) {
    return {
      quantity: parseNumber(numericMatches[numericMatches.length - 1][1]) ?? 1,
      unit: food.basis === "PER_UNIT" ? "piece" : "serving",
    };
  }

  return { quantity: 1, unit: "serving" };
}

function prefixForMention(normalizedInput: string, mention: FoodMention) {
  if (mention.fuzzySegment) {
    const cleaned = mention.fuzzySegment.replace(cleanSegment(mention.fuzzySegment), "");
    return cleaned || mention.fuzzySegment;
  }

  const before = normalizedInput.slice(0, mention.start);
  const lastComma = before.lastIndexOf(",");
  return before.slice(lastComma + 1);
}

function unitWeight(food: FoodNutrition, unit: ServingUnit, quantity: number) {
  if (unit === "gram") return quantity;
  if (unit === "kilogram") return quantity * 1000;
  if (unit === "milliliter") return quantity;

  const mapped = food.unitWeights?.[unit];
  if (mapped) return quantity * mapped;

  if (unit === "cup") return quantity * 150;
  if (unit === "tablespoon") return quantity * 15;
  if (unit === "teaspoon") return quantity * 5;
  if (unit === "bottle") return quantity * 500;
  if (unit === "bowl") return quantity * 300;
  if (unit === "can") return quantity * 120;
  if (unit === "scoop") return quantity * 30;
  if (unit === "slice" && food.unitGrams) return quantity * food.unitGrams;
  if (unit === "piece" && food.unitGrams) return quantity * food.unitGrams;

  return quantity * food.defaultServingGrams;
}

function calculateFoodNutrition(food: FoodNutrition, grams: number, quantity: number, unit: ServingUnit) {
  if (food.basis === "PER_UNIT") {
    const multiplier =
      unit === "gram" || unit === "kilogram" || unit === "milliliter"
        ? grams / (food.unitGrams ?? food.defaultServingGrams)
        : unit === "serving"
          ? 1
          : quantity;

    return {
      calories: food.calories * multiplier,
      protein: food.protein * multiplier,
      carbs: food.carbs * multiplier,
      fat: food.fat * multiplier,
    };
  }

  const multiplier = grams / 100;
  return {
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbs: food.carbs * multiplier,
    fat: food.fat * multiplier,
  };
}

function servingDescription(quantity: number, unit: ServingUnit, grams: number) {
  const displayQuantity = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
  if (unit === "gram") return `${Math.round(grams)}g`;
  if (unit === "kilogram") return `${displayQuantity} kg`;
  if (unit === "milliliter") return `${Math.round(grams)}ml`;
  return `${displayQuantity} ${unit}${quantity === 1 ? "" : "s"} (${Math.round(grams)}g est.)`;
}

function buildDetectedFood(normalizedInput: string, mention: FoodMention): DetectedFood {
  const prefix = prefixForMention(normalizedInput, mention);
  const quantity = extractQuantity(prefix, mention.food);
  const grams = unitWeight(mention.food, quantity.unit, quantity.quantity);
  const nutrition = calculateFoodNutrition(mention.food, grams, quantity.quantity, quantity.unit);

  return {
    id: mention.food.id,
    name: mention.food.name,
    matchedText: mention.fuzzySegment ?? mention.alias,
    quantity: quantity.quantity,
    unit: quantity.unit,
    grams,
    calories: Math.round(nutrition.calories),
    protein: roundMacro(nutrition.protein),
    carbs: roundMacro(nutrition.carbs),
    fat: roundMacro(nutrition.fat),
    confidence: Math.round(mention.confidence * 100),
    servingDescription: servingDescription(quantity.quantity, quantity.unit, grams),
    tags: mention.food.tags,
  };
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateTotals(foods: DetectedFood[]) {
  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fat: totals.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function detectUnknownFoods(normalizedInput: string, mentions: FoodMention[]) {
  const unknown: string[] = [];
  const segments = splitSegments(normalizedInput);

  for (const segment of segments) {
    const segmentStart = normalizedInput.indexOf(segment);
    const segmentEnd = segmentStart + segment.length;
    const hasMention = mentions.some((mention) =>
      rangesOverlap(segmentStart, segmentEnd, mention.start, mention.end),
    );

    if (hasMention) continue;

    const cleaned = cleanSegment(segment);
    if (cleaned && cleaned.length > 2) {
      unknown.push(cleaned);
    }
  }

  return [...new Set(unknown)];
}

function hasTag(foods: DetectedFood[], tag: FoodTag) {
  return foods.some((food) => food.tags.includes(tag));
}

function countTag(foods: DetectedFood[], tag: FoodTag) {
  return foods.filter((food) => food.tags.includes(tag)).length;
}

function macroRatios(totals: { calories: number; protein: number; carbs: number; fat: number }) {
  const macroCalories = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  const denominator = macroCalories > 0 ? macroCalories : Math.max(1, totals.calories);

  return {
    protein: (totals.protein * 4) / denominator,
    carbs: (totals.carbs * 4) / denominator,
    fat: (totals.fat * 9) / denominator,
  };
}

function calculateHealthScore(
  foods: DetectedFood[],
  totals: { calories: number; protein: number; carbs: number; fat: number },
  goal: NutritionGoal,
  unknownCount: number,
) {
  if (foods.length === 0) return 15;

  const ratios = macroRatios(totals);
  let score = 62;

  score += Math.min(14, countTag(foods, "vegetable") * 5 + countTag(foods, "fruit") * 4);
  score += Math.min(10, countTag(foods, "fiber") * 4);
  if (hasTag(foods, "healthy_fat")) score += 4;
  if (totals.protein >= 25) score += 8;
  if (totals.protein >= 40) score += 4;
  if (ratios.protein >= 0.15 && ratios.carbs >= 0.25 && ratios.carbs <= 0.6 && ratios.fat <= 0.4) {
    score += 8;
  }

  if (totals.calories > 900) score -= 10;
  if (totals.calories > 1200) score -= 10;
  if (totals.fat > 35) score -= 8;
  if (countTag(foods, "processed") >= 2) score -= 8;
  if (hasTag(foods, "added_sugar")) score -= 10;
  score -= Math.min(12, unknownCount * 4);

  if (goal === "fat_loss") {
    if (totals.calories <= 650) score += 8;
    if (totals.protein >= 25) score += 8;
    if (totals.calories > 800) score -= 12;
    if (totals.fat > 30) score -= 5;
  }

  if (goal === "muscle_gain") {
    if (totals.protein >= 35) score += 14;
    if (totals.calories >= 450 && totals.calories <= 950) score += 5;
    if (totals.protein < 20) score -= 12;
  }

  if (goal === "healthy_lifestyle") {
    if (countTag(foods, "vegetable") + countTag(foods, "fruit") >= 2) score += 8;
    if (countTag(foods, "processed") === 0) score += 5;
    if (hasTag(foods, "added_sugar")) score -= 8;
  }

  return Math.max(5, Math.min(100, Math.round(score)));
}

function buildFlags(totals: { calories: number; protein: number; carbs: number; fat: number }) {
  const ratios = macroRatios(totals);
  const flags: string[] = [];

  if (totals.protein >= 30 || ratios.protein >= 0.3) flags.push("High protein");
  if (totals.carbs >= 55 || ratios.carbs >= 0.5) flags.push("High carb");
  if (totals.fat >= 25 || ratios.fat >= 0.35) flags.push("High fat");
  if (totals.calories >= 800) flags.push("Calorie dense");
  if (flags.length === 0 && totals.calories > 0) flags.push("Balanced light meal");

  return flags;
}

function buildAdvice(
  foods: DetectedFood[],
  totals: { calories: number; protein: number; carbs: number; fat: number },
  goal: NutritionGoal,
  healthScore: number,
  unknownFoods: string[],
  mlPrediction: NutritionMlPrediction,
) {
  const advice: string[] = [];
  const ratios = macroRatios(totals);

  advice.push(mlPrediction.explanation);

  if (unknownFoods.length > 0) {
    advice.push(`Some items couldn't be fully matched: ${unknownFoods.join(", ")}. The calorie estimate may be slightly lower than the actual meal.`);
  }

  if (goal === "fat_loss") {
    advice.push("For fat loss, keep lean protein high and use vegetables or fruit to increase fullness without adding many calories.");
    if (totals.calories > 750) advice.push("This meal is relatively calorie dense for a fat-loss meal, so portion control matters.");
    if (totals.protein < 25) advice.push("Add a lean protein source such as chicken breast, tuna, egg whites, or Greek yogurt.");
  }

  if (goal === "muscle_gain") {
    advice.push("For muscle gain, aim for a strong protein anchor plus enough carbs to support training performance.");
    if (totals.protein < 30) advice.push("Protein is a bit low for a muscle-gain meal; add chicken, tuna, Greek yogurt, tofu, or whey.");
    if (totals.carbs < 35) advice.push("Consider adding rice, oats, potato, bulgur, or fruit around training sessions.");
  }

  if (goal === "healthy_lifestyle") {
    advice.push("For a healthy lifestyle, prioritize whole foods, colorful produce, quality protein, and moderate portions.");
    if (!hasTag(foods, "vegetable") && !hasTag(foods, "fruit")) {
      advice.push("Add a fruit or vegetable to improve micronutrient density and fiber.");
    }
  }

  if (ratios.fat >= 0.4) advice.push("Fat is a large share of the meal, so keep oils, nuts, cheese, and butter portions measured.");
  if (ratios.carbs >= 0.6) advice.push("Carbs dominate this meal; pair them with protein to improve balance and satiety.");
  if (mlPrediction.goalCompatibility.score < 55) {
    advice.push("Goal compatibility is low, so adjust portions or add a protein/produce anchor for a better fit.");
  }
  if (healthScore >= 80) advice.push("Overall this is a strong meal choice for your selected goal.");

  return advice.slice(0, 5);
}

function betterAlternative(goal: NutritionGoal, healthScore: number, flags: string[]) {
  if (healthScore >= 75) {
    return "This meal is already solid. A small upgrade would be adding salad greens or fruit for extra fiber and micronutrients.";
  }

  if (goal === "fat_loss") {
    return "Try grilled chicken breast with a large salad, yogurt, and a small serving of brown rice or potato.";
  }

  if (goal === "muscle_gain") {
    return "Try chicken breast, rice or oats, Greek yogurt, banana, and a small amount of olive oil or nuts.";
  }

  if (flags.includes("High fat")) {
    return "Try tuna or chicken breast with bulgur, broccoli, tomato, cucumber, and a spoon of olive oil.";
  }

  return "Try eggs or tofu with whole wheat bread, Greek yogurt, berries, and a side salad.";
}

export function analyzeMealText(input: string, goal: NutritionGoal): MealAnalysisResult {
  const normalizedInput = normalizeText(input);

  if (!normalizedInput) {
    const mlPrediction = predictNutritionMl(
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
      goal,
    );

    return {
      input,
      goal,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      confidence: 0,
      healthScore: 0,
      mlPrediction,
      detectedFoods: [],
      unknownFoods: [],
      flags: [],
      advice: ["Type a meal description to analyze calories, macros, and food quality."],
      betterAlternative: "Example: 2 eggs, 1 slice whole wheat bread, tomato, and yogurt.",
    };
  }

  const exactMentions = findExactFoodMentions(normalizedInput);
  const mentions = addFuzzyMentions(normalizedInput, exactMentions);
  const detectedFoods = mentions.map((mention) => buildDetectedFood(normalizedInput, mention));
  const unknownFoods = detectUnknownFoods(normalizedInput, mentions);
  const totals = calculateTotals(detectedFoods);
  const confidence =
    detectedFoods.length > 0
      ? Math.max(
          5,
          Math.round(
            detectedFoods.reduce((sum, food) => sum + food.confidence, 0) / detectedFoods.length -
              unknownFoods.length * 6,
          ),
        )
      : 0;
  const roundedTotals = {
    calories: Math.round(totals.calories),
    protein: roundMacro(totals.protein),
    carbs: roundMacro(totals.carbs),
    fat: roundMacro(totals.fat),
  };
  const heuristicHealthScore = calculateHealthScore(
    detectedFoods,
    roundedTotals,
    goal,
    unknownFoods.length,
  );
  const mlPrediction = predictNutritionMl(roundedTotals, goal);
  const healthScore = Math.round(mlPrediction.healthScore * 0.8 + heuristicHealthScore * 0.2);
  const flags = [...new Set([...buildFlags(roundedTotals), ...mlPrediction.badges])];

  return {
    input,
    goal,
    ...roundedTotals,
    confidence,
    healthScore,
    mlPrediction: {
      ...mlPrediction,
      healthScore,
    },
    detectedFoods,
    unknownFoods,
    flags,
    advice: buildAdvice(detectedFoods, roundedTotals, goal, healthScore, unknownFoods, mlPrediction),
    betterAlternative: betterAlternative(goal, healthScore, flags),
  };
}
