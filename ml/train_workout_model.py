"""Train a small ML model for workout plan-type recommendation.

This script is intentionally separate from the Next.js frontend. It uses the
clean curated workout catalog when available and falls back to structured CSV
fields only if the curated catalog cannot be read.
"""

from __future__ import annotations

import argparse
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CURATED_SOURCE = PROJECT_ROOT / "lib" / "workout-programs.ts"
CSV_SOURCE = PROJECT_ROOT / "data" / "program_summary.csv"
MODEL_PATH = Path(__file__).with_name("workout_model.pkl")

FEATURE_COLUMNS = ["fitness_level", "goal", "equipment", "duration"]
ALLOWED_LEVELS = ["Beginner", "Intermediate", "Advanced"]
ALLOWED_GOALS = ["Fat Loss", "Strength", "Muscle Gain", "Conditioning", "Mobility"]
ALLOWED_EQUIPMENT = ["Full Gym", "At Home", "Bodyweight", "Dumbbells"]
ALLOWED_DURATIONS = [30, 45, 60, 75]

PLAN_TYPE_BY_GOAL = {
    "Fat Loss": "Fat Loss Training Plan",
    "Strength": "Strength Development Plan",
    "Muscle Gain": "Muscle Gain Hypertrophy Plan",
    "Conditioning": "Conditioning Performance Plan",
    "Mobility": "Mobility and Movement Quality Plan",
}

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


def extract_string(block: str, field: str) -> str:
    match = re.search(rf'{field}:\s*"([^"]*)"', block)
    return match.group(1).strip() if match else ""


def extract_number(block: str, field: str) -> int:
    match = re.search(rf"{field}:\s*(\d+)", block)
    return int(match.group(1)) if match else 0


def load_curated_programs() -> pd.DataFrame:
    """Read clean curated workout objects from the frontend data module."""

    if not CURATED_SOURCE.exists():
        raise FileNotFoundError(f"Curated source not found: {CURATED_SOURCE}")

    source = CURATED_SOURCE.read_text(encoding="utf-8")
    blocks = re.findall(r'\{\s*id:\s*"[^"]+".*?\n\s*\}', source, flags=re.DOTALL)
    rows: list[dict[str, Any]] = []

    for block in blocks:
        goal = extract_string(block, "goal")
        level = extract_string(block, "level")
        equipment = extract_string(block, "equipment")
        duration = extract_number(block, "duration")
        title = extract_string(block, "title")

        if (
            level not in ALLOWED_LEVELS
            or goal not in ALLOWED_GOALS
            or equipment not in ALLOWED_EQUIPMENT
            or duration not in ALLOWED_DURATIONS
        ):
            continue

        rows.append(
            {
                "id": extract_string(block, "id"),
                "title": title,
                "description": extract_string(block, "description"),
                "fitness_level": level,
                "goal": goal,
                "equipment": equipment,
                "duration": duration,
                "program_length": extract_number(block, "programLength"),
                "total_exercises": extract_number(block, "totalExercises"),
                "recommended_for": extract_string(block, "recommendedFor"),
                "plan_type": PLAN_TYPE_BY_GOAL[goal],
                "source": "curated_frontend",
            }
        )

    if not rows:
        raise ValueError("No curated workout rows could be parsed.")

    return pd.DataFrame(rows)


def parse_list_field(value: Any) -> list[str]:
    if not isinstance(value, str):
        return []

    matches = re.findall(r"'([^']+)'", value)
    if matches:
        return matches

    return [part.strip() for part in value.strip("[]").split(",") if part.strip()]


def nearest_duration(value: Any) -> int:
    try:
        minutes = float(value)
    except (TypeError, ValueError):
        minutes = 60

    return min(ALLOWED_DURATIONS, key=lambda duration: abs(duration - minutes))


def map_csv_level(levels: list[str]) -> str:
    if "Beginner" in levels or "Novice" in levels:
        return "Beginner"
    if "Advanced" in levels:
        return "Advanced"
    return "Intermediate"


def map_csv_goal(goals: list[str]) -> str:
    goal_set = set(goals)

    if {"Bodybuilding", "Muscle & Sculpting"} & goal_set:
        return "Muscle Gain"
    if {"Powerbuilding", "Powerlifting", "Olympic Weightlifting"} & goal_set:
        return "Strength"
    if {"Athletics"} & goal_set:
        return "Conditioning"
    if {"Bodyweight Fitness"} & goal_set:
        return "Conditioning"
    return "Strength"


def map_csv_equipment(value: Any) -> str:
    equipment = str(value).strip()

    if equipment == "At Home":
        return "At Home"
    if equipment == "Dumbbell Only":
        return "Dumbbells"
    if equipment == "Full Gym" or equipment == "Garage Gym":
        return "Full Gym"
    return "Bodyweight"


def load_structured_csv_programs(limit: int = 500) -> pd.DataFrame:
    """Fallback training data from structured CSV fields only.

    Raw titles and descriptions from the messy CSV are deliberately ignored.
    """

    if not CSV_SOURCE.exists():
        raise FileNotFoundError(f"CSV source not found: {CSV_SOURCE}")

    csv = pd.read_csv(CSV_SOURCE)
    rows: list[dict[str, Any]] = []

    for index, row in csv.head(limit).iterrows():
        level = map_csv_level(parse_list_field(row.get("level")))
        goal = map_csv_goal(parse_list_field(row.get("goal")))
        equipment = map_csv_equipment(row.get("equipment"))
        duration = nearest_duration(row.get("time_per_workout"))

        rows.append(
            {
                "id": f"csv-structured-{index}",
                "title": f"{level} {equipment} {goal} Program",
                "description": f"A structured {goal.lower()} program for {level.lower()} trainees.",
                "fitness_level": level,
                "goal": goal,
                "equipment": equipment,
                "duration": duration,
                "program_length": int(float(row.get("program_length") or 8)),
                "total_exercises": int(float(row.get("total_exercises") or 30)),
                "recommended_for": "Structured training recommendation generated from CSV fields.",
                "plan_type": PLAN_TYPE_BY_GOAL[goal],
                "source": "structured_csv",
            }
        )

    if not rows:
        raise ValueError("No structured CSV rows could be prepared.")

    return pd.DataFrame(rows)


def load_training_data() -> pd.DataFrame:
    try:
        data = load_curated_programs()
        print(f"Loaded {len(data)} curated workout plans from {CURATED_SOURCE}.")
        return data
    except Exception as exc:
        print(f"Curated data unavailable ({exc}). Falling back to structured CSV fields.")
        data = load_structured_csv_programs()
        print(f"Loaded {len(data)} structured CSV rows from {CSV_SOURCE}.")
        return data


def train_model(data: pd.DataFrame) -> Pipeline:
    categorical_features = ["fitness_level", "goal", "equipment"]
    numeric_features = ["duration"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("numeric", "passthrough", numeric_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        min_samples_leaf=1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("classifier", model),
        ]
    )

    return pipeline


def score_plan(row: pd.Series, request: dict[str, Any]) -> int:
    score = 0

    if row["fitness_level"] == request["fitness_level"]:
        score += 25
    elif row["fitness_level"] in LEVEL_NEIGHBORS.get(request["fitness_level"], []):
        score += 12

    if row["goal"] == request["goal"]:
        score += 30

    if row["equipment"] == request["equipment"]:
        score += 25
    elif row["equipment"] in EQUIPMENT_COMPATIBILITY.get(request["equipment"], []):
        score += 14

    gap = abs(int(row["duration"]) - int(request["duration"]))
    if gap == 0:
        score += 20
    elif gap <= 15:
        score += 11
    elif gap <= 30:
        score += 6

    return score


def print_demo_prediction(pipeline: Pipeline, data: pd.DataFrame) -> None:
    request = {
        "fitness_level": "Intermediate",
        "goal": "Muscle Gain",
        "equipment": "Full Gym",
        "duration": 60,
    }
    request_frame = pd.DataFrame([request], columns=FEATURE_COLUMNS)
    predicted_type = pipeline.predict(request_frame)[0]

    ranked = data.copy()
    ranked["match_score"] = ranked.apply(lambda row: score_plan(row, request), axis=1)
    ranked = ranked[ranked["plan_type"] == predicted_type].sort_values(
        by="match_score", ascending=False
    )

    print("\nDemo prediction")
    print(f"Input: {request}")
    print(f"Predicted plan type: {predicted_type}")
    if not ranked.empty:
        best = ranked.iloc[0]
        print(f"Top clean plan: {best['title']} ({best['match_score']}/100)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the workout recommendation ML model.")
    parser.add_argument(
        "--output",
        type=Path,
        default=MODEL_PATH,
        help="Path where the trained joblib model bundle will be saved.",
    )
    args = parser.parse_args()

    data = load_training_data()
    x = data[FEATURE_COLUMNS]
    y = data["plan_type"]

    stratify = y if y.value_counts().min() >= 2 else None
    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify,
    )

    pipeline = train_model(data)
    pipeline.fit(x_train, y_train)

    predictions = pipeline.predict(x_test)
    print("\nEvaluation")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}")
    print(classification_report(y_test, predictions, zero_division=0))

    bundle = {
        "model": pipeline,
        "feature_columns": FEATURE_COLUMNS,
        "allowed_values": {
            "fitness_level": ALLOWED_LEVELS,
            "goal": ALLOWED_GOALS,
            "equipment": ALLOWED_EQUIPMENT,
            "duration": ALLOWED_DURATIONS,
        },
        "plan_type_by_goal": PLAN_TYPE_BY_GOAL,
        "plans": data.to_dict(orient="records"),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_source": data["source"].value_counts().to_dict(),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, args.output)
    print(f"\nSaved trained model bundle to {args.output}.")

    print_demo_prediction(pipeline, data)


if __name__ == "__main__":
    main()
