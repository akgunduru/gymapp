"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  User,
  Activity,
  Flame,
  Utensils,
  Award,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Heart,
  Scale
} from "lucide-react";

type Step = "stats" | "goal" | "meals" | "loading" | "result";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "moderate" | "active";
type DietPreference = "standard" | "vegetarian" | "vegan" | "keto";
type DietGoal = "fat_loss" | "muscle_gain" | "healthy_lifestyle";

interface UserProfileInput {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  activity: ActivityLevel;
  goal: DietGoal;
  dietStyle: DietPreference;
  mealCount: number;
  exclusions: string;
}

interface MealItem {
  name: string;
  baseCalories: number;
  basePortion: string;
  ingredients: { name: string; baseWeightGrams: number; unit: string }[];
}

interface MealPlanTemplates {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

export function AiDietGenerator({
  onClose,
  initialGoal = "healthy_lifestyle"
}: {
  onClose: () => void;
  initialGoal?: DietGoal;
}) {
  const [step, setStep] = useState<Step>("stats");
  const [profile, setProfile] = useState<UserProfileInput>({
    age: 26,
    weight: 75,
    height: 178,
    gender: "male",
    activity: "moderate",
    goal: initialGoal,
    dietStyle: "standard",
    mealCount: 3,
    exclusions: ""
  });

  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{
    bmr: number;
    tdee: number;
    targetCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    menu: { type: string; title: string; calories: number; ingredients: string[] }[];
    coachingAdvice: string[];
  } | null>(null);

  // Loading animations
  const loadingMessages = [
    "Analyzing physical profile...",
    "Calculating BMR (Basal Metabolic Rate)...",
    "Optimizing TDEE (Total Daily Energy Expenditure) based on your goal...",
    "Selecting optimal foods for your diet style (Macro ratios)...",
    "Calculating portion weights in grams...",
    "Your personalized AI Nutrition Report is ready!"
  ];

  useEffect(() => {
    if (step !== "loading") return;

    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          // Trigger generation
          generatePlan();
          setStep("result");
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [step]);

  const handleNext = () => {
    if (step === "stats") setStep("goal");
    else if (step === "goal") setStep("meals");
    else if (step === "meals") setStep("loading");
  };

  const handleBack = () => {
    if (step === "goal") setStep("stats");
    else if (step === "meals") setStep("goal");
  };

  const generatePlan = () => {
    const { age, weight, height, gender, activity, goal, dietStyle, mealCount, exclusions } = profile;

    // 1. Mifflin-St Jeor BMR
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2. TDEE
    let activityMultiplier = 1.2; // sedentary
    if (activity === "moderate") activityMultiplier = 1.55;
    if (activity === "active") activityMultiplier = 1.725;
    const tdee = Math.round(bmr * activityMultiplier);

    // 3. Goal Caloric adjustment
    let targetCalories = tdee;
    if (goal === "fat_loss") {
      targetCalories = tdee - 500;
      if (targetCalories < 1200) targetCalories = 1200; // Safe threshold
    } else if (goal === "muscle_gain") {
      targetCalories = tdee + 300;
    }

    // 4. Macro ratios based on goal & diet type (Keto is different)
    let pRatio = 0.25;
    let cRatio = 0.45;
    let fRatio = 0.30;

    if (dietStyle === "keto") {
      pRatio = 0.20;
      cRatio = 0.05;
      fRatio = 0.75;
    } else if (goal === "fat_loss") {
      pRatio = 0.35;
      cRatio = 0.35;
      fRatio = 0.30;
    } else if (goal === "muscle_gain") {
      pRatio = 0.30;
      cRatio = 0.45;
      fRatio = 0.25;
    }

    const protein = Math.round((targetCalories * pRatio) / 4);
    const carbs = Math.round((targetCalories * cRatio) / 4);
    const fat = Math.round((targetCalories * fRatio) / 9);

    // 5. Portions calculation based on calculated scaling multiplier
    const baseCaloriesReference = mealCount === 2 ? 1800 : mealCount === 4 ? 2200 : 2000;
    const scaleFactor = targetCalories / baseCaloriesReference;

    // Diet plans database
    const mealTemplates: Record<DietPreference, MealPlanTemplates> = {
      standard: {
        breakfast: {
          name: "Peanut Butter & Banana Oatmeal Bowl with Boiled Eggs",
          baseCalories: 550,
          basePortion: "1 bowl",
          ingredients: [
            { name: "Rolled Oats", baseWeightGrams: 60, unit: "g" },
            { name: "Banana", baseWeightGrams: 100, unit: "g" },
            { name: "Peanut Butter", baseWeightGrams: 20, unit: "g" },
            { name: "Boiled Eggs", baseWeightGrams: 100, unit: "g (2 eggs)" },
            { name: "Semi-Skimmed Milk", baseWeightGrams: 150, unit: "ml" }
          ]
        },
        lunch: {
          name: "Grilled Chicken Breast, Jasmine Rice & Roasted Broccoli",
          baseCalories: 650,
          basePortion: "1 large plate",
          ingredients: [
            { name: "Chicken Breast", baseWeightGrams: 150, unit: "g" },
            { name: "Jasmine Rice (Dry)", baseWeightGrams: 80, unit: "g" },
            { name: "Broccoli", baseWeightGrams: 100, unit: "g" },
            { name: "Extra Virgin Olive Oil", baseWeightGrams: 12, unit: "g" }
          ]
        },
        dinner: {
          name: "Baked Salmon Fillet, Roasted Sweet Potato & Asparagus",
          baseCalories: 550,
          basePortion: "1 portion",
          ingredients: [
            { name: "Salmon Fillet", baseWeightGrams: 150, unit: "g" },
            { name: "Sweet Potato", baseWeightGrams: 150, unit: "g" },
            { name: "Asparagus", baseWeightGrams: 80, unit: "g" },
            { name: "Lemon & Olive Oil", baseWeightGrams: 10, unit: "g" }
          ]
        },
        snack: {
          name: "Greek Yogurt, Raw Almonds & Blueberries",
          baseCalories: 250,
          basePortion: "1 bowl",
          ingredients: [
            { name: "Greek Yogurt", baseWeightGrams: 150, unit: "g" },
            { name: "Raw Almonds", baseWeightGrams: 20, unit: "g" },
            { name: "Blueberries", baseWeightGrams: 50, unit: "g" }
          ]
        }
      },
      vegetarian: {
        breakfast: {
          name: "Spinach & Mushroom Omelette, Whole Wheat Toast & Avocado",
          baseCalories: 550,
          basePortion: "1 portion",
          ingredients: [
            { name: "Chicken Eggs", baseWeightGrams: 150, unit: "g (3 eggs)" },
            { name: "Spinach & Mushrooms", baseWeightGrams: 100, unit: "g" },
            { name: "Whole Wheat Bread", baseWeightGrams: 60, unit: "g (2 slices)" },
            { name: "Avocado", baseWeightGrams: 60, unit: "g (half)" }
          ]
        },
        lunch: {
          name: "Quinoa Salad, Red Lentil Soup & Feta Cheese",
          baseCalories: 650,
          basePortion: "1 bowl soup & 1 plate salad",
          ingredients: [
            { name: "Quinoa (Dry)", baseWeightGrams: 70, unit: "g" },
            { name: "Red Lentils", baseWeightGrams: 50, unit: "g" },
            { name: "Feta Cheese", baseWeightGrams: 50, unit: "g" },
            { name: "Olive Oil & Lemon", baseWeightGrams: 15, unit: "g" }
          ]
        },
        dinner: {
          name: "Baked Glazed Tofu, Brown Rice & Vegetable Stir-Fry",
          baseCalories: 550,
          basePortion: "1 plate",
          ingredients: [
            { name: "Tofu", baseWeightGrams: 180, unit: "g" },
            { name: "Brown Rice (Dry)", baseWeightGrams: 70, unit: "g" },
            { name: "Mixed Seasonal Vegetables", baseWeightGrams: 150, unit: "g" },
            { name: "Soy Sauce & Sesame Oil", baseWeightGrams: 10, unit: "g" }
          ]
        },
        snack: {
          name: "Walnuts & Cottage Cheese Rice Cakes",
          baseCalories: 250,
          basePortion: "1 plate",
          ingredients: [
            { name: "Cottage Cheese", baseWeightGrams: 100, unit: "g" },
            { name: "Walnuts", baseWeightGrams: 20, unit: "g" },
            { name: "Rice Cakes", baseWeightGrams: 20, unit: "g" }
          ]
        }
      },
      vegan: {
        breakfast: {
          name: "Chia Seed Almond Milk Pudding with Strawberries & Walnuts",
          baseCalories: 450,
          basePortion: "1 portion",
          ingredients: [
            { name: "Chia Seeds", baseWeightGrams: 35, unit: "g (3 tablespoons)" },
            { name: "Almond Milk (Unsweetened)", baseWeightGrams: 200, unit: "ml" },
            { name: "Fresh Strawberries", baseWeightGrams: 100, unit: "g" },
            { name: "Walnuts", baseWeightGrams: 20, unit: "g" }
          ]
        },
        lunch: {
          name: "Chickpea & Sweet Potato Coconut Curry with Brown Rice",
          baseCalories: 750,
          basePortion: "1 portion",
          ingredients: [
            { name: "Chickpeas (Boiled)", baseWeightGrams: 150, unit: "g" },
            { name: "Sweet Potato", baseWeightGrams: 100, unit: "g" },
            { name: "Coconut Milk", baseWeightGrams: 60, unit: "ml" },
            { name: "Brown Rice (Dry)", baseWeightGrams: 80, unit: "g" }
          ]
        },
        dinner: {
          name: "Stir-Fried Tempeh, Quinoa, Bell Peppers & Roasted Broccoli",
          baseCalories: 550,
          basePortion: "1 plate",
          ingredients: [
            { name: "Tempeh", baseWeightGrams: 140, unit: "g" },
            { name: "Quinoa (Dry)", baseWeightGrams: 70, unit: "g" },
            { name: "Bell Peppers", baseWeightGrams: 100, unit: "g" },
            { name: "Broccoli", baseWeightGrams: 80, unit: "g" },
            { name: "Sesame Oil", baseWeightGrams: 10, unit: "g" }
          ]
        },
        snack: {
          name: "Hummus, Carrot & Cucumber Sticks with Pumpkin Seeds",
          baseCalories: 250,
          basePortion: "1 portion",
          ingredients: [
            { name: "Hummus", baseWeightGrams: 70, unit: "g" },
            { name: "Carrot & Cucumber", baseWeightGrams: 150, unit: "g" },
            { name: "Pumpkin Seeds", baseWeightGrams: 15, unit: "g" }
          ]
        }
      },
      keto: {
        breakfast: {
          name: "Butter-Cooked Bacon & Eggs with Whole Avocado",
          baseCalories: 650,
          basePortion: "1 portion",
          ingredients: [
            { name: "Chicken Eggs", baseWeightGrams: 150, unit: "g (3 eggs)" },
            { name: "Bacon", baseWeightGrams: 40, unit: "g" },
            { name: "Butter", baseWeightGrams: 15, unit: "g" },
            { name: "Ripe Avocado", baseWeightGrams: 120, unit: "g (1 whole)" }
          ]
        },
        lunch: {
          name: "Grilled Ribeye Steak with Garlic Herb Butter & Roasted Asparagus",
          baseCalories: 750,
          basePortion: "1 large portion",
          ingredients: [
            { name: "Ribeye Steak", baseWeightGrams: 200, unit: "g" },
            { name: "Garlic Herb Butter", baseWeightGrams: 20, unit: "g" },
            { name: "Asparagus", baseWeightGrams: 100, unit: "g" },
            { name: "Olive Oil", baseWeightGrams: 10, unit: "g" }
          ]
        },
        dinner: {
          name: "Baked Creamy Spinach & Parmesan Chicken Thighs",
          baseCalories: 600,
          basePortion: "1 portion",
          ingredients: [
            { name: "Chicken Thighs (Boneless)", baseWeightGrams: 180, unit: "g" },
            { name: "Spinach", baseWeightGrams: 150, unit: "g" },
            { name: "Heavy Cream", baseWeightGrams: 60, unit: "ml" },
            { name: "Parmesan Cheese", baseWeightGrams: 20, unit: "g" }
          ]
        },
        snack: {
          name: "Macadamia Nuts & Celery Sticks with Cream Cheese",
          baseCalories: 300,
          basePortion: "1 plate",
          ingredients: [
            { name: "Macadamia Nuts", baseWeightGrams: 30, unit: "g" },
            { name: "Celery Sticks", baseWeightGrams: 100, unit: "g" },
            { name: "Full-Fat Cream Cheese", baseWeightGrams: 50, unit: "g" }
          ]
        }
      }
    };

    const activeTemplates = mealTemplates[dietStyle];
    const generatedMeals: { type: string; title: string; calories: number; ingredients: string[] }[] = [];

    // Helper to generate ingredient strings with dynamic weight scaling
    const scaleIngredients = (items: { name: string; baseWeightGrams: number; unit: string }[]) => {
      return items.map((ing) => {
        const scaledWeight = Math.round(ing.baseWeightGrams * scaleFactor);
        const exclusionsClean = exclusions.trim().toLowerCase();
        if (exclusionsClean && ing.name.toLowerCase().includes(exclusionsClean)) {
          return `${ing.name} (Can substitute with an alternative) - ${scaledWeight}${ing.unit}`;
        }
        return `${ing.name} - ${scaledWeight}${ing.unit}`;
      });
    };

    if (mealCount === 2) {
      // Intermittent Fasting structure: Lunch & Dinner scaled to targeted calories
      generatedMeals.push({
        type: "MEAL 1 (LUNCH)",
        title: activeTemplates.lunch.name,
        calories: Math.round(activeTemplates.lunch.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.lunch.ingredients)
      });
      generatedMeals.push({
        type: "MEAL 2 (DINNER)",
        title: activeTemplates.dinner.name,
        calories: Math.round(activeTemplates.dinner.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.dinner.ingredients)
      });
    } else if (mealCount === 4 && activeTemplates.snack) {
      // 3 Meals + 1 Snack
      generatedMeals.push({
        type: "BREAKFAST",
        title: activeTemplates.breakfast.name,
        calories: Math.round(activeTemplates.breakfast.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.breakfast.ingredients)
      });
      generatedMeals.push({
        type: "LUNCH",
        title: activeTemplates.lunch.name,
        calories: Math.round(activeTemplates.lunch.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.lunch.ingredients)
      });
      generatedMeals.push({
        type: "SNACK",
        title: activeTemplates.snack.name,
        calories: Math.round(activeTemplates.snack.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.snack.ingredients)
      });
      generatedMeals.push({
        type: "DINNER",
        title: activeTemplates.dinner.name,
        calories: Math.round(activeTemplates.dinner.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.dinner.ingredients)
      });
    } else {
      // Standard 3 Meals
      generatedMeals.push({
        type: "BREAKFAST",
        title: activeTemplates.breakfast.name,
        calories: Math.round(activeTemplates.breakfast.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.breakfast.ingredients)
      });
      generatedMeals.push({
        type: "LUNCH",
        title: activeTemplates.lunch.name,
        calories: Math.round(activeTemplates.lunch.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.lunch.ingredients)
      });
      generatedMeals.push({
        type: "DINNER",
        title: activeTemplates.dinner.name,
        calories: Math.round(activeTemplates.dinner.baseCalories * scaleFactor),
        ingredients: scaleIngredients(activeTemplates.dinner.ingredients)
      });
    }

    // Dynamic advice
    const coachingAdvice: string[] = [];
    if (goal === "fat_loss") {
      coachingAdvice.push("Caloric deficit active. Increasing your daily water intake to at least 3 liters will optimize fat oxidation.");
      coachingAdvice.push("To increase fiber intake, you can freely add leafy green vegetables as side salads without limits.");
    } else if (goal === "muscle_gain") {
      coachingAdvice.push("Caloric surplus configured for muscle hypertrophy. To support protein synthesis, consume your main meals 1-2 hours after weight training.");
      coachingAdvice.push("Complex carbohydrates (quinoa, sweet potatoes, brown rice) will effectively replenish your muscle glycogen stores.");
    } else {
      coachingAdvice.push("A balanced distribution of meals has been established, focusing on micronutrient density for general well-being.");
    }

    if (dietStyle === "keto") {
      coachingAdvice.push("Carbohydrates have been restricted to a minimum level (5%) to support ketosis. Keep an eye on salt and sodium balance to prevent keto flu symptoms.");
    }

    if (exclusions.trim()) {
      coachingAdvice.push(`Your excluded foods "${exclusions}" have been taken into account, or custom alternatives have been suggested in portion calculations.`);
    }

    setResult({
      bmr: Math.round(bmr),
      tdee,
      targetCalories: Math.round(targetCalories),
      protein,
      carbs,
      fat,
      menu: generatedMeals,
      coachingAdvice
    });
  };

  const getDietStyleLabel = (style: DietPreference) => {
    const labels = {
      standard: "Standard (Mixed)",
      vegetarian: "Vegetarian",
      vegan: "Vegan",
      keto: "Ketogenic (Low Carb)"
    };
    return labels[style];
  };

  const getGoalLabel = (g: DietGoal) => {
    const labels = {
      fat_loss: "Fat Loss / Weight Management",
      muscle_gain: "Muscle Gain / Hypertrophy",
      healthy_lifestyle: "Healthy Lifestyle / Form Preservation"
    };
    return labels[g];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 text-white shadow-2xl transition-all duration-300">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" />
        
        {/* Decorative ambient blobs */}
        <div className="absolute -top-24 -right-24 -z-10 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-600 to-transparent opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 -z-10 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-600 to-transparent opacity-15 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">AI Diet Program Generator</h2>
              <p className="text-xs text-slate-400">Smart & scientifically portion-scaled nutrition guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-8">
          
          {/* STEP 1: PHYSICAL STATS */}
          {step === "stats" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-950/40 p-4 border border-slate-800 flex items-center gap-4">
                <Scale className="h-8 w-8 text-emerald-400 shrink-0" />
                <p className="text-sm leading-relaxed text-slate-300">
                  <strong>Step 1: Physical Profile.</strong> Input your baseline body measurements so we can accurately calculate your Basal Metabolic Rate (BMR) and daily calorie targets.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: "male" })}
                      className={`flex-1 rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
                        profile.gender === "male"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/10 border-transparent"
                          : "border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-850"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: "female" })}
                      className={`flex-1 rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${
                        profile.gender === "female"
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/10 border-transparent"
                          : "border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-850"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Age (Years)</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: Math.max(1, Number(e.target.value)) })}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="E.g. 26"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: Math.max(50, Number(e.target.value)) })}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="E.g. 178"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: Math.max(10, Number(e.target.value)) })}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="E.g. 75"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Daily Physical Activity</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "sedentary", label: "Sedentary", desc: "Desk job, little to no exercise" },
                      { value: "moderate", label: "Moderately Active", desc: "Training 3-4 days per week" },
                      { value: "active", label: "Highly Active", desc: "Heavy training 5+ days per week" }
                    ].map((act) => (
                      <button
                        key={act.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, activity: act.value as ActivityLevel })}
                        className={`rounded-xl p-4 text-left border transition ${
                          profile.activity === act.value
                            ? "bg-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80"
                        }`}
                      >
                        <p className={`text-xs font-black ${profile.activity === act.value ? "text-white" : "text-slate-300"}`}>
                          {act.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">{act.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GOAL & PREFERENCE */}
          {step === "goal" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-950/40 p-4 border border-slate-800 flex items-center gap-4">
                <Brain className="h-8 w-8 text-cyan-400 shrink-0" />
                <p className="text-sm leading-relaxed text-slate-300">
                  <strong>Step 2: Nutrition Style & Goals.</strong> Select your primary target and your preferred dietary style. Calorie and portion weights will adapt specifically to these choices.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Fitness Goal</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "fat_loss", label: "Fat Loss", desc: "Create a caloric deficit to burn fat", icon: "🔥" },
                      { value: "muscle_gain", label: "Muscle Gain", desc: "Caloric surplus and protein focus", icon: "💪" },
                      { value: "healthy_lifestyle", label: "Healthy Lifestyle", desc: "Maintain current form and balance", icon: "🍏" }
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, goal: g.value as DietGoal })}
                        className={`rounded-xl p-4 text-left border transition flex gap-3 items-start ${
                          profile.goal === g.value
                            ? "bg-slate-950 border-emerald-500 shadow-md"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80"
                        }`}
                      >
                        <span className="text-xl mt-0.5">{g.icon}</span>
                        <div>
                          <p className={`text-xs font-black ${profile.goal === g.value ? "text-white" : "text-slate-300"}`}>
                            {g.label}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">{g.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Dietary Style</label>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { value: "standard", label: "Standard (Mixed)", desc: "Balanced meat, poultry, veggies, grains", icon: "🍗" },
                      { value: "vegetarian", label: "Vegetarian", desc: "No meat/poultry, includes dairy & eggs", icon: "🧀" },
                      { value: "vegan", label: "Vegan", desc: "100% plant-based ingredients", icon: "🌱" },
                      { value: "keto", label: "Ketogenic", desc: "High healthy fats, minimum carbs", icon: "🥑" }
                    ].map((diet) => (
                      <button
                        key={diet.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, dietStyle: diet.value as DietPreference })}
                        className={`rounded-xl p-4 text-left border transition ${
                          profile.dietStyle === diet.value
                            ? "bg-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80"
                        }`}
                      >
                        <span className="text-xl">{diet.icon}</span>
                        <p className={`text-xs font-black mt-2 ${profile.dietStyle === diet.value ? "text-white" : "text-slate-300"}`}>
                          {diet.label}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1">{diet.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEALS & EXCLUSIONS */}
          {step === "meals" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-950/40 p-4 border border-slate-800 flex items-center gap-4">
                <Utensils className="h-8 w-8 text-violet-400 shrink-0" />
                <p className="text-sm leading-relaxed text-slate-300">
                  <strong>Step 3: Meal Structure.</strong> Choose the meal frequency that best fits your daily routine, and add any disliked foods or allergies.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Daily Meal Count</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: 2, label: "2 Meals (Intermittent Fasting)", desc: "Focus on Lunch and Dinner" },
                      { value: 3, label: "3 Meals (Standard)", desc: "Breakfast, Lunch, and Dinner" },
                      { value: 4, label: "4 Meals (with Snack)", desc: "3 Main meals + 1 Snack" }
                    ].map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, mealCount: m.value })}
                        className={`rounded-xl p-4 text-left border transition ${
                          profile.mealCount === m.value
                            ? "bg-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500/20"
                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80"
                        }`}
                      >
                        <p className={`text-xs font-black ${profile.mealCount === m.value ? "text-white" : "text-slate-300"}`}>
                          {m.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="exclusions" className="block text-xs font-bold uppercase tracking-wider text-slate-400">Disliked Foods / Allergies (Optional)</label>
                    <span className="text-[10px] text-slate-500 font-bold">E.g. Oats, Tomatoes, Peanut</span>
                  </div>
                  <input
                    id="exclusions"
                    type="text"
                    value={profile.exclusions}
                    onChange={(e) => setProfile({ ...profile, exclusions: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="Enter foods you want to exclude or find alternatives for..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI LOADING SCREEN */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white">AI is Compiling Your Nutrition Plan...</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400 leading-5">
                Your physical profile and dietary targets are being processed with our smart nutrition engine.
              </p>

              {/* Progress log animation */}
              <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-left text-xs text-slate-400 space-y-2">
                {loadingMessages.map((msg, index) => {
                  const isVisible = index <= loadingStep;
                  const isCurrent = index === loadingStep;
                  return (
                    <div
                      key={msg}
                      className={`flex items-center gap-2 transition duration-300 ${
                        isCurrent
                          ? "text-emerald-400 font-bold"
                          : isVisible
                          ? "text-slate-500"
                          : "opacity-0"
                      }`}
                    >
                      {isVisible && (
                        <>
                          {isCurrent ? (
                            <span className="animate-ping text-[8px]">●</span>
                          ) : (
                            <span>✓</span>
                          )}
                          <span>{msg}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: DETAILED DIET GENERATED RESULT */}
          {step === "result" && result && (
            <div className="space-y-6">
              
              {/* Top Macro Summary Dashboard */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 bg-orange-500/10 p-2 rounded-xl text-orange-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Calorie Target</p>
                  <p className="mt-1 text-3xl font-black text-white">{result.targetCalories.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kcal</span></p>
                  <p className="mt-2 text-[10px] text-slate-500">Based on TDEE ({result.tdee} kcal).</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Protein</p>
                  <p className="mt-1 text-3xl font-black text-white">{result.protein} <span className="text-xs font-semibold text-slate-400">g</span></p>
                  <p className="mt-2 text-[10px] text-slate-500">Muscle recovery & synthesis.</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 bg-cyan-500/10 p-2 rounded-xl text-cyan-400">
                    <Layers className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Carbs</p>
                  <p className="mt-1 text-3xl font-black text-white">{result.carbs} <span className="text-xs font-semibold text-slate-400">g</span></p>
                  <p className="mt-2 text-[10px] text-slate-500">Daily energy & glycogen.</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 relative overflow-hidden">
                  <div className="absolute right-3 top-3 bg-violet-500/10 p-2 rounded-xl text-violet-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Fat</p>
                  <p className="mt-1 text-3xl font-black text-white">{result.fat} <span className="text-xs font-semibold text-slate-400">g</span></p>
                  <p className="mt-2 text-[10px] text-slate-500">Healthy fats & hormone balance.</p>
                </div>
              </div>

              {/* Meal Cards Layout */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Daily AI Diet Plan ({getDietStyleLabel(profile.dietStyle)})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.menu.map((meal) => (
                    <div key={meal.type} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
                          {meal.type}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          🔥 {meal.calories} kcal
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-sm text-white leading-relaxed">{meal.title}</h4>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Portion Weights & Ingredients:</p>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {meal.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-center gap-2 leading-relaxed">
                              <span className="text-emerald-500">●</span>
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Coach Insights & Suggestions */}
              <div className="rounded-2xl border border-violet-800/40 bg-violet-950/10 p-6 relative overflow-hidden">
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-violet-500/10 blur-xl" />
                <h3 className="text-sm font-black uppercase tracking-wider text-violet-400 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Nutrition Coach Report & Tips
                </h3>
                <div className="space-y-3">
                  {result.coachingAdvice.map((advice, idx) => (
                    <div key={idx} className="flex gap-3 text-xs text-slate-300 leading-6">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-1" />
                      <p>{advice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadatas & Re-generate */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
                <div className="text-[10px] text-slate-500 font-bold space-y-1">
                  <p>BMR: {result.bmr} kcal • TDEE: {result.tdee} kcal</p>
                  <p>Profile: {getGoalLabel(profile.goal)} • {profile.mealCount} Meals</p>
                </div>

                <button
                  onClick={() => setStep("stats")}
                  className="flex h-10 items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950 px-4 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Recalculate
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer (Controls) */}
        {step !== "loading" && step !== "result" && (
          <div className="flex justify-between border-t border-slate-800 bg-slate-950/30 px-6 py-4 sm:px-8">
            {step !== "stats" ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div /> // spacer
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 text-sm font-black text-white shadow-lg shadow-emerald-500/10 transition hover:opacity-95"
            >
              {step === "meals" ? "Generate Plan" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
