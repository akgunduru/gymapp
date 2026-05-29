"""Run terminal predictions with the trained offline nutrition ML model."""

from __future__ import annotations

import argparse
import json
import warnings
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore", message="Pandas requires version")

import joblib
import pandas as pd


MODEL_PATH = Path(__file__).with_name("nutrition_model.pkl")

FEATURE_COLUMNS = [
    "calories",
    "protein",
    "carbs",
    "fat",
    "protein_ratio",
    "carb_ratio",
    "fat_ratio",
]

CATEGORY_LABELS = {
    "high_protein": "High Protein Meal",
    "high_carb": "High Carb Meal",
    "balanced": "Balanced Meal",
    "high_fat": "High Fat Meal",
    "fat_loss_friendly": "Fat Loss Friendly",
    "muscle_gain_friendly": "Muscle Gain Friendly",
}


def load_bundle(model_path: Path) -> dict[str, Any]:
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found: {model_path}. Run python ml/train_nutrition_model.py first."
        )

    return joblib.load(model_path)


def build_features(calories: float, protein: float, carbs: float, fat: float) -> dict[str, float]:
    macro_calories = protein * 4 + carbs * 4 + fat * 9
    denominator = max(1.0, macro_calories)
    return {
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "protein_ratio": (protein * 4) / denominator,
        "carb_ratio": (carbs * 4) / denominator,
        "fat_ratio": (fat * 9) / denominator,
    }


def health_score(category: str, features: dict[str, float], goal: str) -> int:
    base_scores = {
        "fat_loss_friendly": 88,
        "muscle_gain_friendly": 86,
        "balanced": 80,
        "high_protein": 76,
        "high_carb": 58,
        "high_fat": 52,
    }
    score = base_scores.get(category, 65)

    if features["protein"] >= 25:
        score += 5
    if features["protein_ratio"] >= 0.25:
        score += 4
    if 0.2 <= features["fat_ratio"] <= 0.38:
        score += 3
    if features["calories"] > 950:
        score -= 10
    if features["fat"] > 35:
        score -= 8
    if features["carb_ratio"] > 0.65:
        score -= 5

    if goal == "fat_loss":
        if category == "fat_loss_friendly":
            score += 7
        if features["calories"] > 750:
            score -= 8
    elif goal == "muscle_gain":
        if category == "muscle_gain_friendly":
            score += 7
        if features["protein"] < 25:
            score -= 8
    else:
        if category == "balanced":
            score += 6

    return max(5, min(100, round(score)))


def compatibility(category: str, features: dict[str, float], goal: str) -> dict[str, Any]:
    score = 62
    if goal == "fat_loss":
        if category == "fat_loss_friendly":
            score += 28
        if features["protein"] >= 24:
            score += 8
        if features["calories"] > 800:
            score -= 16
        if category == "high_fat":
            score -= 12
    elif goal == "muscle_gain":
        if category == "muscle_gain_friendly":
            score += 28
        if features["protein"] >= 30:
            score += 10
        if features["carbs"] >= 35:
            score += 5
        if features["protein"] < 20:
            score -= 18
    else:
        if category == "balanced":
            score += 25
        if features["fat_ratio"] <= 0.42 and features["carb_ratio"] <= 0.62:
            score += 8

    clamped = max(5, min(100, round(score)))
    label = "Excellent" if clamped >= 85 else "Good" if clamped >= 70 else "Moderate" if clamped >= 50 else "Low"
    return {"label": label, "score": clamped}


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict nutrition meal category from macro totals.")
    parser.add_argument("--calories", required=True, type=float)
    parser.add_argument("--protein", required=True, type=float)
    parser.add_argument("--carbs", required=True, type=float)
    parser.add_argument("--fat", required=True, type=float)
    parser.add_argument(
        "--goal",
        choices=["fat_loss", "muscle_gain", "healthy_lifestyle"],
        default="healthy_lifestyle",
    )
    parser.add_argument("--model", type=Path, default=MODEL_PATH)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    bundle = load_bundle(args.model)
    features = build_features(args.calories, args.protein, args.carbs, args.fat)
    frame = pd.DataFrame([features], columns=bundle["feature_columns"])
    model = bundle["model"]
    category = str(model.predict(frame)[0])

    probabilities = []
    confidence = None
    if hasattr(model, "predict_proba"):
        values = model.predict_proba(frame)[0]
        probabilities = sorted(
            [
                {
                    "category": str(label),
                    "label": CATEGORY_LABELS.get(str(label), str(label)),
                    "probability": round(float(probability), 4),
                }
                for label, probability in zip(model.classes_, values)
            ],
            key=lambda item: item["probability"],
            reverse=True,
        )
        confidence = probabilities[0]["probability"] if probabilities else None

    goal_fit = compatibility(category, features, args.goal)
    result = {
        "input": {
            "calories": args.calories,
            "protein": args.protein,
            "carbs": args.carbs,
            "fat": args.fat,
            "goal": args.goal,
        },
        "mealCategory": category,
        "mealCategoryLabel": CATEGORY_LABELS.get(category, category),
        "confidence": confidence,
        "healthScore": health_score(category, features, args.goal),
        "goalCompatibility": goal_fit,
        "topProbabilities": probabilities[:3],
    }

    if args.json:
        print(json.dumps(result, indent=2))
        return

    print("Nutrition ML Prediction")
    print(
        "Input: "
        f"{args.calories:.0f} kcal | {args.protein:.1f}g protein | "
        f"{args.carbs:.1f}g carbs | {args.fat:.1f}g fat | goal {args.goal}"
    )
    print(f"Meal classification: {result['mealCategoryLabel']}")
    if confidence is not None:
        print(f"Model confidence: {confidence:.0%}")
    print(f"Health score: {result['healthScore']}/100")
    print(
        "Goal compatibility: "
        f"{goal_fit['label']} ({goal_fit['score']}/100)"
    )


if __name__ == "__main__":
    main()
