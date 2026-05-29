# Workout Recommendation ML Workflow

This folder contains a small, presentation-friendly machine learning workflow for the Social Gym workout recommender.

The ML code is separate from the Next.js frontend. It does not use Prisma, authentication, backend routes, or database logic.

## What The Model Learns

The model predicts a clean workout plan type from four inputs:

- fitness level
- goal
- equipment
- workout duration

The trainer uses the curated clean workout catalog in `lib/workout-programs.ts`. If that catalog is unavailable, it can fall back to structured fields from `data/program_summary.csv`, but it does not use messy raw CSV titles or descriptions.

Model type:

- `RandomForestClassifier`

Saved model:

- `ml/workout_model.pkl`

## Install ML Dependencies

From the project root:

```bash
python3 -m venv .venv-ml
source .venv-ml/bin/activate
pip install -r ml/requirements.txt
```

## Train The Model

```bash
python ml/train_workout_model.py
```

Expected result:

- The script loads the curated workout plans.
- It trains and evaluates a scikit-learn model.
- It saves `ml/workout_model.pkl`.
- It prints a demo prediction.

## Run A Terminal Prediction

```bash
python ml/predict_workout.py \
  --level Intermediate \
  --goal "Muscle Gain" \
  --equipment "Full Gym" \
  --duration 60
```

Example output includes:

- predicted workout plan type
- model confidence
- top clean recommended plans
- match score for each suggested plan

JSON output is also available:

```bash
python ml/predict_workout.py \
  --level Beginner \
  --goal "Fat Loss" \
  --equipment "At Home" \
  --duration 30 \
  --json
```

## Allowed Input Values

Levels:

- `Beginner`
- `Intermediate`
- `Advanced`

Goals:

- `Fat Loss`
- `Strength`
- `Muscle Gain`
- `Conditioning`
- `Mobility`

Equipment:

- `Full Gym`
- `At Home`
- `Bodyweight`
- `Dumbbells`

Durations:

- `30`
- `45`
- `60`
- `75`

---

# Nutrition Analyzer ML Workflow

The nutrition analyzer is also offline and separate from Prisma/auth/backend logic. It combines a generated local food dataset, TypeScript meal parsing, and a trained scikit-learn model.

## What The Model Learns

The nutrition model classifies meal macro totals into:

- `high_protein`
- `high_carb`
- `balanced`
- `high_fat`
- `fat_loss_friendly`
- `muscle_gain_friendly`

Training features:

- calories
- protein
- carbs
- fat
- protein ratio
- carb ratio
- fat ratio

Saved files:

- `data/foods.json` - generated local nutrition knowledge base with 200+ common foods
- `ml/nutrition_model.pkl` - trained scikit-learn model for terminal predictions
- `data/nutrition_model_tree.json` - exported decision tree used by the Next.js frontend offline

## Train The Nutrition Model

```bash
python ml/train_nutrition_model.py
```

Expected result:

- The script generates `data/foods.json`.
- It creates synthetic meal examples from the local food dataset.
- It trains a `DecisionTreeClassifier`.
- It saves `ml/nutrition_model.pkl`.
- It exports `data/nutrition_model_tree.json` for the frontend.

## Run A Nutrition Prediction

```bash
python ml/predict_nutrition.py \
  --calories 650 \
  --protein 42 \
  --carbs 68 \
  --fat 14 \
  --goal muscle_gain
```

JSON output is also available:

```bash
python ml/predict_nutrition.py \
  --calories 420 \
  --protein 32 \
  --carbs 35 \
  --fat 9 \
  --goal fat_loss \
  --json
```

The Nutrition page uses the exported tree JSON so meal analysis still works locally without Python running in the background.
