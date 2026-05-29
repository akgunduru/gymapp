"""Run terminal predictions with the trained workout ML model."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


MODEL_PATH = Path(__file__).with_name("workout_model.pkl")

LEVEL_NEIGHBORS = {
    "Beginner": ["Intermediate"],
    "Intermediate": ["Beginner", "Advanced"],
    "Advanced": ["Intermediate"],
}

EQUIPMENT_COMPATIBILITY = {
    "At Home": ["Bodyweight", "Dumbbells"],
    "Bodyweight": ["At Home"],
    "Dumbbells": ["At Home", "Full Gym"],
    "Full Gym": ["Dumbbells"],
}


def load_bundle(model_path: Path) -> dict[str, Any]:
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found: {model_path}. Run python ml/train_workout_model.py first."
        )

    return joblib.load(model_path)


def validate_choice(name: str, value: Any, allowed: list[Any]) -> None:
    if value not in allowed:
        joined = ", ".join(str(item) for item in allowed)
        raise ValueError(f"Invalid {name}: {value}. Allowed values: {joined}")


def score_plan(plan: dict[str, Any], request: dict[str, Any]) -> int:
    score = 0

    if plan["fitness_level"] == request["fitness_level"]:
        score += 25
    elif plan["fitness_level"] in LEVEL_NEIGHBORS.get(request["fitness_level"], []):
        score += 12

    if plan["goal"] == request["goal"]:
        score += 30

    if plan["equipment"] == request["equipment"]:
        score += 25
    elif plan["equipment"] in EQUIPMENT_COMPATIBILITY.get(request["equipment"], []):
        score += 14

    duration_gap = abs(int(plan["duration"]) - int(request["duration"]))
    if duration_gap == 0:
        score += 20
    elif duration_gap <= 15:
        score += 11
    elif duration_gap <= 30:
        score += 6

    return score


def recommend_plans(bundle: dict[str, Any], request: dict[str, Any], plan_type: str) -> list[dict[str, Any]]:
    plans = [
        plan for plan in bundle["plans"] if plan.get("plan_type") == plan_type
    ]

    if not plans:
        plans = bundle["plans"]

    ranked = sorted(
        (
            {
                "title": plan["title"],
                "description": plan["description"],
                "level": plan["fitness_level"],
                "goal": plan["goal"],
                "equipment": plan["equipment"],
                "duration": int(plan["duration"]),
                "programLength": int(plan["program_length"]),
                "totalExercises": int(plan["total_exercises"]),
                "recommendedFor": plan["recommended_for"],
                "matchScore": score_plan(plan, request),
            }
            for plan in plans
        ),
        key=lambda plan: plan["matchScore"],
        reverse=True,
    )

    return ranked[:3]


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict a workout plan type from user inputs.")
    parser.add_argument("--level", required=True, help="Fitness level, e.g. Intermediate")
    parser.add_argument("--goal", required=True, help="Goal, e.g. Muscle Gain")
    parser.add_argument("--equipment", required=True, help="Equipment, e.g. Full Gym")
    parser.add_argument("--duration", required=True, type=int, help="Workout duration in minutes")
    parser.add_argument("--model", type=Path, default=MODEL_PATH, help="Path to workout_model.pkl")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON output")
    args = parser.parse_args()

    bundle = load_bundle(args.model)
    allowed = bundle["allowed_values"]

    request = {
        "fitness_level": args.level,
        "goal": args.goal,
        "equipment": args.equipment,
        "duration": args.duration,
    }

    validate_choice("level", request["fitness_level"], allowed["fitness_level"])
    validate_choice("goal", request["goal"], allowed["goal"])
    validate_choice("equipment", request["equipment"], allowed["equipment"])
    validate_choice("duration", request["duration"], allowed["duration"])

    feature_frame = pd.DataFrame([request], columns=bundle["feature_columns"])
    model = bundle["model"]
    predicted_type = model.predict(feature_frame)[0]

    confidence = None
    probabilities = []
    if hasattr(model, "predict_proba"):
        probability_values = model.predict_proba(feature_frame)[0]
        classes = list(model.classes_)
        probabilities = sorted(
            [
                {"planType": plan_type, "probability": round(float(probability), 4)}
                for plan_type, probability in zip(classes, probability_values)
            ],
            key=lambda item: item["probability"],
            reverse=True,
        )
        confidence = probabilities[0]["probability"] if probabilities else None

    result = {
        "input": {
            "level": args.level,
            "goal": args.goal,
            "equipment": args.equipment,
            "duration": args.duration,
        },
        "predictedPlanType": predicted_type,
        "confidence": confidence,
        "topPlanTypeProbabilities": probabilities[:3],
        "recommendedPlans": recommend_plans(bundle, request, predicted_type),
    }

    if args.json:
        print(json.dumps(result, indent=2))
        return

    print("Workout ML Prediction")
    print(f"Input: {args.level} / {args.goal} / {args.equipment} / {args.duration} min")
    print(f"Predicted plan type: {predicted_type}")
    if confidence is not None:
        print(f"Model confidence: {confidence:.0%}")

    print("\nRecommended clean plans:")
    for index, plan in enumerate(result["recommendedPlans"], start=1):
        print(f"{index}. {plan['title']} - {plan['matchScore']}/100 match")
        print(f"   {plan['description']}")
        print(
            "   "
            f"{plan['level']} | {plan['goal']} | {plan['equipment']} | "
            f"{plan['duration']} min | {plan['programLength']} weeks"
        )


if __name__ == "__main__":
    main()
