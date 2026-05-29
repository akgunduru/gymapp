"""Train an offline nutrition meal classifier for the Social-Gym Nutrition page.

The script generates a local food knowledge base, creates synthetic meal
examples from those foods, trains a small scikit-learn DecisionTreeClassifier,
and exports both a Python pickle and a JSON decision tree that the Next.js
frontend can run without calling external AI APIs.
"""

from __future__ import annotations

import json
import random
import re
import warnings
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore", message="Pandas requires version")

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
FOODS_PATH = DATA_DIR / "foods.json"
TREE_EXPORT_PATH = DATA_DIR / "nutrition_model_tree.json"
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


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def pluralize_alias(value: str) -> str:
    if value.endswith("s"):
        return value
    if value.endswith("y"):
        return f"{value[:-1]}ies"
    return f"{value}s"


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        cleaned = value.lower().strip()
        if not cleaned or cleaned in seen:
            continue
        result.append(cleaned)
        seen.add(cleaned)
    return result


def food(
    name: str,
    aliases: list[str],
    serving_type: str,
    calories: float,
    protein: float,
    carbs: float,
    fat: float,
    tags: list[str],
    unit_basis: str = "per_100g",
    default_grams: int = 100,
    unit_grams: int | None = None,
    unit_weights: dict[str, int] | None = None,
) -> dict[str, Any]:
    alias_values = unique([name, *aliases, pluralize_alias(name.lower())])
    item: dict[str, Any] = {
        "id": slugify(name),
        "name": name,
        "aliases": alias_values,
        "servingType": serving_type,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "unitBasis": unit_basis,
        "defaultServingGrams": default_grams,
        "tags": tags,
    }
    if unit_grams is not None:
        item["unitGrams"] = unit_grams
    if unit_weights:
        item["unitWeights"] = unit_weights
    return item


def build_food_dataset() -> list[dict[str, Any]]:
    # Nutrition values are approximate and intended for demo guidance only.
    protein = ["protein", "whole_food"]
    lean = ["lean_protein", "protein", "whole_food"]
    carb = ["carb", "whole_food"]
    fiber_carb = ["carb", "fiber", "whole_food"]
    fruit = ["fruit", "fiber", "whole_food"]
    veg = ["vegetable", "fiber", "whole_food"]
    dairy = ["dairy", "protein", "whole_food"]
    fat = ["healthy_fat", "whole_food"]
    processed = ["processed"]
    sweet = ["processed", "added_sugar"]

    foods = [
        food("Egg", ["eggs", "whole egg"], "piece", 72, 6.3, 0.4, 4.8, protein, "per_unit", 50, 50),
        food("Egg White", ["egg whites"], "piece", 17, 3.6, 0.2, 0.0, lean, "per_unit", 33, 33),
        food("Chicken Breast", ["chicken", "grilled chicken"], "100g", 165, 31, 0, 3.6, lean, default_grams=120),
        food("Chicken Thigh", ["thigh", "chicken leg"], "100g", 209, 26, 0, 10.9, protein, default_grams=120),
        food("Turkey Breast", ["turkey", "turkey slices"], "100g", 135, 29, 0, 1.5, lean, default_grams=120),
        food("Ground Turkey", ["minced turkey"], "100g", 176, 27, 0, 8, protein, default_grams=120),
        food("Tuna", ["canned tuna", "tuna fish"], "100g", 132, 28, 0, 1, lean, default_grams=120, unit_weights={"can": 120}),
        food("Salmon", ["salmon fillet"], "100g", 208, 20, 0, 13, ["protein", "healthy_fat", "whole_food"], default_grams=140),
        food("Cod", ["white fish"], "100g", 105, 23, 0, 0.9, lean, default_grams=140),
        food("Tilapia", ["tilapia fish"], "100g", 129, 26, 0, 2.7, lean, default_grams=140),
        food("Shrimp", ["prawns"], "100g", 99, 24, 0.2, 0.3, lean, default_grams=120),
        food("Crab", ["crab meat"], "100g", 97, 19, 0, 1.5, lean, default_grams=120),
        food("Mussels", ["mussel"], "100g", 172, 24, 7, 4.5, protein, default_grams=120),
        food("Sardines", ["sardine"], "100g", 208, 25, 0, 11, ["protein", "healthy_fat", "whole_food"], default_grams=100, unit_weights={"can": 100}),
        food("Mackerel", ["mackerel fish"], "100g", 205, 19, 0, 14, ["protein", "healthy_fat", "whole_food"], default_grams=130),
        food("Lean Beef", ["beef", "ground beef"], "100g", 217, 26, 0, 12, protein, default_grams=120),
        food("Steak", ["beef steak"], "100g", 250, 26, 0, 15, protein, default_grams=150),
        food("Pork Loin", ["pork"], "100g", 190, 27, 0, 8, protein, default_grams=120),
        food("Turkey Sausage", ["sausage"], "100g", 196, 19, 2, 12, ["protein", "processed"], default_grams=90),
        food("Chicken Sausage", ["chicken sausage"], "100g", 172, 18, 3, 10, ["protein", "processed"], default_grams=90),
        food("Tofu", ["firm tofu"], "100g", 144, 17, 3, 8, protein, default_grams=120),
        food("Tempeh", ["soy tempeh"], "100g", 193, 20, 9, 11, protein, default_grams=120),
        food("Seitan", ["wheat protein"], "100g", 370, 75, 14, 2, lean, default_grams=100),
        food("Edamame", ["soybeans"], "100g", 121, 11, 9, 5, ["protein", "carb", "fiber", "whole_food"], default_grams=100),
        food("Lentils", ["lentil", "green lentils"], "100g", 116, 9, 20, 0.4, ["protein", "carb", "fiber", "whole_food"], default_grams=150, unit_weights={"cup": 200, "bowl": 250}),
        food("Chickpeas", ["chickpea", "garbanzo beans"], "100g", 164, 9, 27, 2.6, ["protein", "carb", "fiber", "whole_food"], default_grams=150, unit_weights={"cup": 165, "bowl": 230}),
        food("Black Beans", ["black bean"], "100g", 132, 9, 24, 0.5, ["protein", "carb", "fiber", "whole_food"], default_grams=150),
        food("Kidney Beans", ["kidney bean"], "100g", 127, 9, 23, 0.5, ["protein", "carb", "fiber", "whole_food"], default_grams=150),
        food("White Beans", ["white bean"], "100g", 139, 10, 25, 0.4, ["protein", "carb", "fiber", "whole_food"], default_grams=150),
        food("Hummus", ["humus"], "100g", 166, 8, 14, 10, ["protein", "carb", "healthy_fat", "fiber", "whole_food"], default_grams=60, unit_weights={"tablespoon": 15}),
        food("Greek Yogurt", ["greek yoghurt", "strained yogurt"], "100g", 73, 10, 3.9, 1.9, dairy, default_grams=170, unit_weights={"cup": 245}),
        food("Cottage Cheese", ["cottage"], "100g", 98, 11, 3.4, 4.3, dairy, default_grams=150, unit_weights={"cup": 220}),
        food("Protein Powder", ["whey", "whey protein", "protein scoop"], "scoop", 120, 24, 3, 1.5, ["lean_protein", "protein", "processed"], "per_unit", 30, 30, {"scoop": 30}),
        food("Protein Shake", ["whey shake", "shake"], "bottle", 180, 30, 8, 3, ["lean_protein", "protein", "processed"], "per_unit", 330, 330, {"bottle": 330}),
        food("White Rice", ["rice", "cooked rice"], "100g", 130, 2.7, 28, 0.3, carb, default_grams=150, unit_weights={"cup": 160, "bowl": 250}),
        food("Brown Rice", ["brown rice"], "100g", 111, 2.6, 23, 0.9, fiber_carb, default_grams=150, unit_weights={"cup": 195, "bowl": 260}),
        food("Basmati Rice", ["basmati"], "100g", 121, 3.5, 25, 0.4, carb, default_grams=150, unit_weights={"cup": 160}),
        food("Bulgur", ["bulgur wheat"], "100g", 83, 3.1, 19, 0.2, fiber_carb, default_grams=160, unit_weights={"cup": 180}),
        food("Couscous", ["cuscus"], "100g", 112, 3.8, 23, 0.2, carb, default_grams=160, unit_weights={"cup": 175}),
        food("Quinoa", ["cooked quinoa"], "100g", 120, 4.4, 21, 1.9, ["protein", "carb", "fiber", "whole_food"], default_grams=150, unit_weights={"cup": 185}),
        food("Oats", ["oatmeal", "rolled oats"], "100g", 389, 16.9, 66, 6.9, fiber_carb, default_grams=50, unit_weights={"cup": 80, "bowl": 60}),
        food("Granola", ["granola cereal"], "100g", 471, 10, 64, 20, ["carb", "fiber", "processed"], default_grams=45, unit_weights={"cup": 90}),
        food("Muesli", ["muesli cereal"], "100g", 340, 10, 66, 5, fiber_carb, default_grams=55, unit_weights={"cup": 85}),
        food("Whole Wheat Bread", ["whole grain bread", "brown bread"], "slice", 80, 4, 14, 1, fiber_carb, "per_unit", 32, 32, {"slice": 32}),
        food("White Bread", ["bread", "toast bread"], "slice", 75, 2.5, 14, 1, ["carb", "processed"], "per_unit", 30, 30, {"slice": 30}),
        food("Sourdough Bread", ["sourdough"], "slice", 110, 4, 22, 1, carb, "per_unit", 45, 45, {"slice": 45}),
        food("Rye Bread", ["rye"], "slice", 83, 3, 15, 1.1, fiber_carb, "per_unit", 32, 32, {"slice": 32}),
        food("Pita Bread", ["pita"], "piece", 165, 5.5, 33, 1, carb, "per_unit", 60, 60),
        food("Tortilla", ["wrap", "flour tortilla"], "piece", 140, 4, 24, 3.5, ["carb", "processed"], "per_unit", 50, 50),
        food("Bagel", ["plain bagel"], "piece", 270, 10, 53, 1.5, carb, "per_unit", 100, 100),
        food("Simit", ["turkish bagel"], "piece", 300, 9, 52, 7, ["carb", "processed"], "per_unit", 100, 100),
        food("Pasta", ["spaghetti", "macaroni", "cooked pasta"], "100g", 158, 5.8, 31, 0.9, carb, default_grams=180, unit_weights={"cup": 140, "bowl": 260}),
        food("Whole Wheat Pasta", ["whole grain pasta"], "100g", 149, 6, 30, 1.5, fiber_carb, default_grams=180),
        food("Rice Noodles", ["rice noodle"], "100g", 109, 1.8, 25, 0.2, carb, default_grams=180),
        food("Udon Noodles", ["udon"], "100g", 127, 3.5, 26, 0.2, carb, default_grams=180),
        food("Ramen Noodles", ["ramen"], "100g", 188, 5, 27, 7, ["carb", "processed"], default_grams=180),
        food("Potato", ["boiled potato"], "100g", 87, 1.9, 20, 0.1, fiber_carb, default_grams=180, unit_weights={"piece": 170}),
        food("Sweet Potato", ["yam"], "100g", 86, 1.6, 20, 0.1, fiber_carb, default_grams=180, unit_weights={"piece": 150}),
        food("Corn", ["sweet corn"], "100g", 96, 3.4, 21, 1.5, fiber_carb, default_grams=120, unit_weights={"cup": 165}),
        food("Peas", ["green peas"], "100g", 81, 5.4, 14, 0.4, ["carb", "fiber", "vegetable", "whole_food"], default_grams=100),
        food("Barley", ["cooked barley"], "100g", 123, 2.3, 28, 0.4, fiber_carb, default_grams=160),
        food("Buckwheat", ["buckwheat groats"], "100g", 92, 3.4, 20, 0.6, fiber_carb, default_grams=160),
        food("Farro", ["emmer"], "100g", 140, 5, 27, 1, fiber_carb, default_grams=160),
        food("Millet", ["cooked millet"], "100g", 119, 3.5, 24, 1, fiber_carb, default_grams=160),
        food("Polenta", ["cornmeal"], "100g", 70, 1.5, 15, 0.2, carb, default_grams=180),
        food("Rice Cake", ["rice cakes"], "piece", 35, 0.7, 7.3, 0.3, ["carb", "processed"], "per_unit", 9, 9),
        food("Crackers", ["whole wheat crackers"], "100g", 430, 9, 70, 12, ["carb", "processed"], default_grams=30),
        food("Pretzels", ["pretzel"], "100g", 380, 10, 80, 3, ["carb", "processed"], default_grams=35),
        food("Popcorn", ["air popped popcorn"], "100g", 387, 13, 78, 4.5, ["carb", "fiber", "processed"], default_grams=30, unit_weights={"cup": 8, "bowl": 25}),
        food("Cereal", ["breakfast cereal"], "100g", 379, 7, 84, 1, ["carb", "processed", "added_sugar"], default_grams=45, unit_weights={"cup": 40}),
        food("Bran Cereal", ["fiber cereal"], "100g", 216, 10, 64, 4, ["carb", "fiber", "processed"], default_grams=45),
        food("Pancake", ["pancakes"], "piece", 95, 2.4, 16, 2.5, ["carb", "processed"], "per_unit", 40, 40),
        food("Waffle", ["waffles"], "piece", 180, 4, 30, 5, ["carb", "processed"], "per_unit", 70, 70),
        food("Banana", ["bananas"], "piece", 105, 1.3, 27, 0.3, fruit, "per_unit", 118, 118),
        food("Apple", ["apples"], "piece", 95, 0.5, 25, 0.3, fruit, "per_unit", 182, 182),
        food("Orange", ["oranges"], "piece", 62, 1.2, 15, 0.2, fruit, "per_unit", 131, 131),
        food("Strawberries", ["strawberry"], "100g", 32, 0.7, 7.7, 0.3, fruit, default_grams=150, unit_weights={"cup": 150}),
        food("Blueberries", ["blueberry"], "100g", 57, 0.7, 14, 0.3, fruit, default_grams=100, unit_weights={"cup": 148}),
        food("Raspberries", ["raspberry"], "100g", 52, 1.2, 12, 0.7, fruit, default_grams=100, unit_weights={"cup": 123}),
        food("Blackberries", ["blackberry"], "100g", 43, 1.4, 10, 0.5, fruit, default_grams=100),
        food("Grapes", ["grape"], "100g", 69, 0.7, 18, 0.2, fruit, default_grams=150, unit_weights={"cup": 150}),
        food("Watermelon", ["melon"], "100g", 30, 0.6, 8, 0.2, fruit, default_grams=250),
        food("Cantaloupe", ["cantaloupe melon"], "100g", 34, 0.8, 8, 0.2, fruit, default_grams=200),
        food("Pineapple", ["ananas"], "100g", 50, 0.5, 13, 0.1, fruit, default_grams=150),
        food("Mango", ["mangos"], "100g", 60, 0.8, 15, 0.4, fruit, default_grams=165),
        food("Pear", ["pears"], "piece", 101, 0.6, 27, 0.2, fruit, "per_unit", 178, 178),
        food("Peach", ["peaches"], "piece", 59, 1.4, 14, 0.4, fruit, "per_unit", 150, 150),
        food("Kiwi", ["kiwifruit"], "piece", 42, 0.8, 10, 0.4, fruit, "per_unit", 69, 69),
        food("Pomegranate", ["pomegranate seeds"], "100g", 83, 1.7, 19, 1.2, fruit, default_grams=100),
        food("Dates", ["date"], "piece", 66, 0.4, 18, 0, ["fruit", "fiber", "added_sugar", "whole_food"], "per_unit", 24, 24),
        food("Raisins", ["raisin"], "100g", 299, 3.1, 79, 0.5, ["fruit", "fiber", "added_sugar", "whole_food"], default_grams=40),
        food("Figs", ["fig"], "piece", 37, 0.4, 10, 0.2, fruit, "per_unit", 50, 50),
        food("Cherries", ["cherry"], "100g", 63, 1.1, 16, 0.2, fruit, default_grams=100),
        food("Plum", ["plums"], "piece", 30, 0.5, 7.5, 0.2, fruit, "per_unit", 66, 66),
        food("Grapefruit", ["grapefruits"], "piece", 82, 1.6, 20, 0.3, fruit, "per_unit", 230, 230),
        food("Apricot", ["apricots"], "piece", 17, 0.5, 3.9, 0.1, fruit, "per_unit", 35, 35),
        food("Coconut", ["coconut meat"], "100g", 354, 3.3, 15, 33, ["fruit", "healthy_fat", "whole_food"], default_grams=45),
        food("Avocado", ["avocados"], "piece", 240, 3, 12, 22, ["fruit", "healthy_fat", "fiber", "whole_food"], "per_unit", 150, 150),
        food("Broccoli", ["brocoli"], "100g", 35, 2.4, 7, 0.4, veg, default_grams=120, unit_weights={"cup": 90}),
        food("Spinach", ["baby spinach"], "100g", 23, 2.9, 3.6, 0.4, veg, default_grams=80, unit_weights={"cup": 30}),
        food("Kale", ["curly kale"], "100g", 49, 4.3, 8.8, 0.9, veg, default_grams=80),
        food("Lettuce", ["romaine"], "100g", 15, 1.4, 2.9, 0.2, veg, default_grams=80),
        food("Arugula", ["rocket"], "100g", 25, 2.6, 3.7, 0.7, veg, default_grams=50),
        food("Tomato", ["tomatoes"], "piece", 22, 1.1, 4.8, 0.2, veg, "per_unit", 120, 120),
        food("Cucumber", ["cucumbers"], "piece", 16, 0.7, 3.8, 0.1, veg, "per_unit", 100, 100),
        food("Carrot", ["carrots"], "piece", 25, 0.6, 6, 0.1, veg, "per_unit", 61, 61),
        food("Bell Pepper", ["pepper", "red pepper"], "piece", 31, 1, 7, 0.3, veg, "per_unit", 120, 120),
        food("Onion", ["onions"], "100g", 40, 1.1, 9.3, 0.1, veg, default_grams=80),
        food("Garlic", ["garlic clove"], "piece", 4, 0.2, 1, 0, veg, "per_unit", 3, 3),
        food("Mushroom", ["mushrooms"], "100g", 22, 3.1, 3.3, 0.3, veg, default_grams=100),
        food("Zucchini", ["courgette"], "100g", 17, 1.2, 3.1, 0.3, veg, default_grams=150),
        food("Eggplant", ["aubergine"], "100g", 25, 1, 6, 0.2, veg, default_grams=150),
        food("Cauliflower", ["cauli"], "100g", 25, 1.9, 5, 0.3, veg, default_grams=120),
        food("Cabbage", ["white cabbage"], "100g", 25, 1.3, 6, 0.1, veg, default_grams=100),
        food("Red Cabbage", ["purple cabbage"], "100g", 31, 1.4, 7, 0.2, veg, default_grams=100),
        food("Green Beans", ["green bean"], "100g", 31, 1.8, 7, 0.1, veg, default_grams=120),
        food("Asparagus", ["asparagus spears"], "100g", 20, 2.2, 3.9, 0.1, veg, default_grams=100),
        food("Brussels Sprouts", ["brussel sprouts"], "100g", 43, 3.4, 9, 0.3, veg, default_grams=100),
        food("Celery", ["celery sticks"], "100g", 16, 0.7, 3, 0.2, veg, default_grams=80),
        food("Beetroot", ["beets"], "100g", 43, 1.6, 10, 0.2, veg, default_grams=100),
        food("Pumpkin", ["pumpkin squash"], "100g", 26, 1, 6.5, 0.1, veg, default_grams=150),
        food("Butternut Squash", ["squash"], "100g", 45, 1, 12, 0.1, veg, default_grams=150),
        food("Radish", ["radishes"], "100g", 16, 0.7, 3.4, 0.1, veg, default_grams=50),
        food("Parsley", ["fresh parsley"], "100g", 36, 3, 6, 0.8, veg, default_grams=15),
        food("Artichoke", ["artichokes"], "100g", 47, 3.3, 11, 0.2, veg, default_grams=120),
        food("Okra", ["lady finger"], "100g", 33, 1.9, 7, 0.2, veg, default_grams=100),
        food("Leek", ["leeks"], "100g", 61, 1.5, 14, 0.3, veg, default_grams=100),
        food("Mixed Salad", ["salad", "green salad"], "bowl", 45, 2, 8, 0.5, veg, "per_unit", 200, 200, {"bowl": 200}),
        food("Olives", ["black olives", "green olives"], "100g", 145, 1, 4, 15, ["vegetable", "healthy_fat", "whole_food"], default_grams=30),
        food("Sauerkraut", ["fermented cabbage"], "100g", 19, 0.9, 4.3, 0.1, veg, default_grams=80),
        food("Bok Choy", ["pak choi"], "100g", 13, 1.5, 2.2, 0.2, veg, default_grams=100),
        food("Swiss Chard", ["chard"], "100g", 19, 1.8, 3.7, 0.2, veg, default_grams=100),
        food("Fennel", ["fennel bulb"], "100g", 31, 1.2, 7.3, 0.2, veg, default_grams=100),
        food("Pickles", ["pickle"], "100g", 12, 0.5, 2.4, 0.2, veg, default_grams=60),
        food("Seaweed", ["nori"], "100g", 45, 5.8, 9, 0.6, veg, default_grams=10),
        food("Milk", ["whole milk"], "cup", 149, 7.7, 11.7, 8, dairy, "per_unit", 244, 244, {"cup": 244}),
        food("Skim Milk", ["fat free milk"], "cup", 83, 8.3, 12.2, 0.2, dairy, "per_unit", 244, 244, {"cup": 244}),
        food("Almond Milk", ["unsweetened almond milk"], "cup", 35, 1, 1, 2.5, ["healthy_fat", "processed"], "per_unit", 240, 240, {"cup": 240}),
        food("Soy Milk", ["soya milk"], "cup", 100, 7, 8, 4, ["protein", "processed"], "per_unit", 240, 240, {"cup": 240}),
        food("Oat Milk", ["oat drink"], "cup", 120, 3, 16, 5, ["carb", "processed"], "per_unit", 240, 240, {"cup": 240}),
        food("Yogurt", ["plain yogurt", "yoghurt"], "100g", 61, 3.5, 4.7, 3.3, dairy, default_grams=170, unit_weights={"cup": 245}),
        food("Kefir", ["plain kefir"], "cup", 110, 9, 12, 2, dairy, "per_unit", 240, 240, {"cup": 240}),
        food("Ayran", ["yogurt drink"], "bottle", 80, 5, 6, 3, dairy, "per_unit", 250, 250, {"bottle": 250}),
        food("Cheese", ["white cheese"], "100g", 265, 18, 3, 21, dairy, default_grams=30, unit_weights={"slice": 25}),
        food("Cheddar Cheese", ["cheddar"], "100g", 403, 25, 1.3, 33, dairy, default_grams=30, unit_weights={"slice": 28}),
        food("Feta Cheese", ["feta"], "100g", 264, 14, 4, 21, dairy, default_grams=40),
        food("Mozzarella", ["mozzarella cheese"], "100g", 280, 18, 3, 22, dairy, default_grams=40),
        food("Parmesan", ["parmesan cheese"], "100g", 431, 38, 4, 29, dairy, default_grams=15),
        food("Ricotta", ["ricotta cheese"], "100g", 174, 11, 3, 13, dairy, default_grams=60),
        food("Cream Cheese", ["cream cheese spread"], "100g", 342, 6, 4, 34, ["dairy", "processed"], default_grams=30, unit_weights={"tablespoon": 15}),
        food("Labneh", ["labne"], "100g", 165, 9, 6, 11, dairy, default_grams=60),
        food("Butter", ["butter pat"], "tablespoon", 102, 0.1, 0, 11.5, ["dairy", "healthy_fat"], "per_unit", 14, 14, {"tablespoon": 14, "teaspoon": 5}),
        food("Chocolate Milk", ["cocoa milk"], "cup", 208, 8, 26, 8, ["dairy", "added_sugar", "processed"], "per_unit", 240, 240, {"cup": 240}),
        food("Ice Cream", ["vanilla ice cream"], "100g", 207, 3.5, 24, 11, sweet, default_grams=100, unit_weights={"cup": 135}),
        food("Olive Oil", ["oil", "extra virgin olive oil"], "tablespoon", 119, 0, 0, 13.5, fat, "per_unit", 14, 14, {"tablespoon": 14, "teaspoon": 5}),
        food("Avocado Oil", ["avocado oil"], "tablespoon", 124, 0, 0, 14, fat, "per_unit", 14, 14, {"tablespoon": 14}),
        food("Coconut Oil", ["coconut oil"], "tablespoon", 121, 0, 0, 13.5, ["healthy_fat", "processed"], "per_unit", 14, 14, {"tablespoon": 14}),
        food("Peanut Butter", ["peanut spread"], "tablespoon", 94, 3.5, 3.2, 8, ["protein", "healthy_fat", "whole_food"], "per_unit", 16, 16, {"tablespoon": 16}),
        food("Almond Butter", ["almond spread"], "tablespoon", 98, 3.4, 3, 9, ["protein", "healthy_fat", "whole_food"], "per_unit", 16, 16, {"tablespoon": 16}),
        food("Tahini", ["sesame paste"], "tablespoon", 89, 2.6, 3.2, 8, ["protein", "healthy_fat", "whole_food"], "per_unit", 15, 15, {"tablespoon": 15}),
        food("Almonds", ["almond"], "100g", 579, 21, 22, 50, ["protein", "healthy_fat", "fiber", "whole_food"], default_grams=30),
        food("Walnuts", ["walnut"], "100g", 654, 15, 14, 65, ["healthy_fat", "fiber", "whole_food"], default_grams=30),
        food("Cashews", ["cashew"], "100g", 553, 18, 30, 44, ["protein", "healthy_fat", "whole_food"], default_grams=30),
        food("Pistachios", ["pistachio"], "100g", 560, 20, 28, 45, ["protein", "healthy_fat", "fiber", "whole_food"], default_grams=30),
        food("Hazelnuts", ["hazelnut"], "100g", 628, 15, 17, 61, ["healthy_fat", "fiber", "whole_food"], default_grams=30),
        food("Peanuts", ["peanut"], "100g", 567, 26, 16, 49, ["protein", "healthy_fat", "whole_food"], default_grams=30),
        food("Mixed Nuts", ["nuts"], "100g", 607, 20, 21, 54, ["protein", "healthy_fat", "fiber", "whole_food"], default_grams=30),
        food("Chia Seeds", ["chia"], "100g", 486, 17, 42, 31, ["protein", "healthy_fat", "fiber", "whole_food"], default_grams=15, unit_weights={"tablespoon": 12}),
        food("Flaxseeds", ["flax seeds"], "100g", 534, 18, 29, 42, ["protein", "healthy_fat", "fiber", "whole_food"], default_grams=15, unit_weights={"tablespoon": 10}),
        food("Pumpkin Seeds", ["pepitas"], "100g", 559, 30, 11, 49, ["protein", "healthy_fat", "whole_food"], default_grams=25),
        food("Sunflower Seeds", ["sunflower seed"], "100g", 584, 21, 20, 51, ["protein", "healthy_fat", "whole_food"], default_grams=25),
        food("Sesame Seeds", ["sesame"], "100g", 573, 18, 23, 50, ["protein", "healthy_fat", "whole_food"], default_grams=15),
        food("Guacamole", ["avocado dip"], "100g", 150, 2, 9, 13, ["healthy_fat", "fiber", "whole_food"], default_grams=60),
        food("Pesto", ["basil pesto"], "100g", 418, 5, 6, 42, ["healthy_fat", "processed"], default_grams=30),
        food("Mayonnaise", ["mayo"], "tablespoon", 94, 0.1, 0.1, 10, ["processed", "healthy_fat"], "per_unit", 14, 14, {"tablespoon": 14}),
        food("Dark Chocolate", ["dark chocolate square"], "100g", 546, 4.9, 61, 31, ["healthy_fat", "added_sugar", "processed"], default_grams=25),
        food("Protein Bar", ["protein bars"], "piece", 220, 20, 22, 7, ["protein", "processed", "added_sugar"], "per_unit", 60, 60),
        food("Granola Bar", ["cereal bar"], "piece", 140, 3, 24, 4, sweet, "per_unit", 35, 35),
        food("Chocolate Bar", ["chocolate"], "piece", 230, 3, 26, 13, sweet, "per_unit", 45, 45),
        food("Cookie", ["cookies"], "piece", 80, 1, 11, 4, sweet, "per_unit", 18, 18),
        food("Cake", ["cake slice"], "slice", 350, 5, 50, 15, sweet, "per_unit", 100, 100, {"slice": 100}),
        food("Muffin", ["muffins"], "piece", 340, 6, 52, 12, sweet, "per_unit", 110, 110),
        food("Donut", ["doughnut"], "piece", 260, 3, 31, 14, sweet, "per_unit", 70, 70),
        food("Chips", ["potato chips", "crisps"], "100g", 536, 7, 53, 35, processed, default_grams=40),
        food("French Fries", ["fries"], "100g", 312, 3.4, 41, 15, processed, default_grams=120),
        food("Pizza", ["pizza slice"], "slice", 285, 12, 36, 10, ["protein", "carb", "processed"], "per_unit", 107, 107, {"slice": 107}),
        food("Hamburger", ["burger"], "piece", 354, 17, 29, 19, ["protein", "carb", "processed"], "per_unit", 150, 150),
        food("Cheeseburger", ["cheese burger"], "piece", 420, 22, 31, 24, ["protein", "carb", "processed"], "per_unit", 170, 170),
        food("Hot Dog", ["hotdog"], "piece", 290, 10, 24, 17, ["protein", "carb", "processed"], "per_unit", 100, 100),
        food("Chicken Nuggets", ["nuggets"], "100g", 296, 15, 18, 19, ["protein", "processed"], default_grams=100),
        food("Borek", ["börek", "cheese pastry"], "piece", 330, 9, 34, 18, ["carb", "processed"], "per_unit", 120, 120),
        food("Lahmacun", ["turkish pizza"], "piece", 300, 15, 38, 10, ["protein", "carb", "processed"], "per_unit", 130, 130),
        food("Kebab", ["doner", "döner"], "100g", 250, 20, 2, 18, protein, default_grams=150),
        food("Soda", ["cola", "soft drink"], "bottle", 210, 0, 54, 0, sweet, "per_unit", 500, 500, {"bottle": 500}),
        food("Orange Juice", ["oj"], "cup", 112, 1.7, 26, 0.5, ["fruit", "added_sugar"], "per_unit", 240, 240, {"cup": 240}),
        food("Apple Juice", ["apple drink"], "cup", 114, 0.2, 28, 0.3, ["fruit", "added_sugar"], "per_unit", 240, 240, {"cup": 240}),
        food("Sports Drink", ["isotonic drink"], "bottle", 130, 0, 34, 0, sweet, "per_unit", 500, 500, {"bottle": 500}),
        food("Beer", ["lager"], "bottle", 153, 1.6, 13, 0, processed, "per_unit", 355, 355, {"bottle": 355}),
        food("Wine", ["red wine", "white wine"], "cup", 125, 0.1, 4, 0, processed, "per_unit", 150, 150, {"cup": 150}),
        food("Coffee", ["black coffee"], "cup", 2, 0.3, 0, 0, [], "per_unit", 240, 240, {"cup": 240}),
        food("Latte", ["cafe latte"], "cup", 150, 8, 13, 7, dairy, "per_unit", 350, 350, {"cup": 350}),
        food("Tea", ["black tea"], "cup", 2, 0, 0, 0, [], "per_unit", 240, 240, {"cup": 240}),
        food("Smoothie", ["fruit smoothie"], "bottle", 250, 5, 50, 3, ["fruit", "added_sugar"], "per_unit", 350, 350, {"bottle": 350}),
        food("Vegetable Soup", ["veggie soup"], "bowl", 120, 5, 20, 3, veg, "per_unit", 300, 300, {"bowl": 300}),
        food("Lentil Soup", ["mercimek soup"], "bowl", 230, 14, 35, 4, ["protein", "carb", "fiber", "whole_food"], "per_unit", 320, 320, {"bowl": 320}),
        food("Chicken Soup", ["chicken broth soup"], "bowl", 180, 18, 12, 6, protein, "per_unit", 320, 320, {"bowl": 320}),
        food("Tomato Soup", ["tomato soup"], "bowl", 150, 4, 24, 4, veg, "per_unit", 300, 300, {"bowl": 300}),
        food("Honey", ["bal"], "tablespoon", 64, 0, 17, 0, ["added_sugar", "whole_food"], "per_unit", 21, 21, {"tablespoon": 21, "teaspoon": 7}),
        food("Jam", ["fruit jam"], "tablespoon", 56, 0, 14, 0, sweet, "per_unit", 20, 20, {"tablespoon": 20}),
        food("Sugar", ["white sugar"], "teaspoon", 16, 0, 4, 0, ["added_sugar", "processed"], "per_unit", 4, 4, {"teaspoon": 4, "tablespoon": 12}),
        food("Ketchup", ["tomato ketchup"], "tablespoon", 17, 0.2, 4.5, 0, ["processed", "added_sugar"], "per_unit", 17, 17, {"tablespoon": 17}),
        food("Salad Dressing", ["dressing"], "tablespoon", 73, 0.2, 2, 7.5, ["processed", "healthy_fat"], "per_unit", 15, 15, {"tablespoon": 15}),
    ]

    return foods


def write_food_dataset(foods: list[dict[str, Any]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "notice": "Nutrition values are approximate and intended for demo guidance only.",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "foods": foods,
    }
    FOODS_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def macro_totals(meal_foods: list[tuple[dict[str, Any], float]]) -> dict[str, float]:
    totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}

    for item, grams in meal_foods:
        if item["unitBasis"] == "per_unit":
            unit_grams = float(item.get("unitGrams") or item["defaultServingGrams"])
            multiplier = grams / unit_grams
        else:
            multiplier = grams / 100

        totals["calories"] += float(item["calories"]) * multiplier
        totals["protein"] += float(item["protein"]) * multiplier
        totals["carbs"] += float(item["carbs"]) * multiplier
        totals["fat"] += float(item["fat"]) * multiplier

    return totals


def feature_row(totals: dict[str, float]) -> dict[str, float]:
    macro_calories = totals["protein"] * 4 + totals["carbs"] * 4 + totals["fat"] * 9
    denominator = max(1.0, macro_calories)
    return {
        "calories": round(totals["calories"], 2),
        "protein": round(totals["protein"], 2),
        "carbs": round(totals["carbs"], 2),
        "fat": round(totals["fat"], 2),
        "protein_ratio": round((totals["protein"] * 4) / denominator, 4),
        "carb_ratio": round((totals["carbs"] * 4) / denominator, 4),
        "fat_ratio": round((totals["fat"] * 9) / denominator, 4),
    }


def label_meal(row: dict[str, float]) -> str:
    if row["calories"] >= 450 and row["protein"] >= 30 and row["carbs"] >= 35 and row["fat_ratio"] <= 0.42:
        return "muscle_gain_friendly"
    if row["calories"] <= 650 and row["protein"] >= 24 and row["fat"] <= 24 and row["carb_ratio"] <= 0.58:
        return "fat_loss_friendly"
    if row["protein"] >= 32 and row["protein_ratio"] >= 0.32:
        return "high_protein"
    if row["fat"] >= 28 and row["fat_ratio"] >= 0.42:
        return "high_fat"
    if row["carbs"] >= 55 and row["carb_ratio"] >= 0.58:
        return "high_carb"
    return "balanced"


def random_serving_grams(item: dict[str, Any], rng: random.Random) -> float:
    if item["unitBasis"] == "per_unit":
        return float(item.get("unitGrams") or item["defaultServingGrams"]) * rng.choice([1, 1, 1, 2, 0.5])

    default = float(item["defaultServingGrams"])
    return default * rng.choice([0.5, 0.75, 1, 1, 1.25, 1.5, 2])


def generate_training_data(foods: list[dict[str, Any]], samples: int = 6000) -> pd.DataFrame:
    rng = random.Random(42)
    rows: list[dict[str, Any]] = []

    for _ in range(samples):
        meal_size = rng.choices([1, 2, 3, 4, 5], weights=[8, 22, 34, 24, 12], k=1)[0]
        chosen = rng.sample(foods, meal_size)
        meal = [(item, random_serving_grams(item, rng)) for item in chosen]
        row = feature_row(macro_totals(meal))
        row["category"] = label_meal(row)
        rows.append(row)

    return pd.DataFrame(rows)


def train_model(data: pd.DataFrame) -> DecisionTreeClassifier:
    model = DecisionTreeClassifier(
        max_depth=7,
        min_samples_leaf=18,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(data[FEATURE_COLUMNS], data["category"])
    return model


def export_tree(model: DecisionTreeClassifier, metrics: dict[str, Any], foods_count: int) -> None:
    tree = model.tree_
    classes = [str(label) for label in model.classes_]
    nodes: list[dict[str, Any]] = []

    for node_id in range(tree.node_count):
        class_counts = [float(value) for value in tree.value[node_id][0]]
        predicted_index = max(range(len(class_counts)), key=lambda index: class_counts[index])
        total = sum(class_counts) or 1.0
        probability = class_counts[predicted_index] / total

        if tree.children_left[node_id] == tree.children_right[node_id]:
            nodes.append(
                {
                    "id": node_id,
                    "isLeaf": True,
                    "predictedClass": classes[predicted_index],
                    "probability": round(probability, 4),
                    "classCounts": {
                        classes[index]: round(count, 4)
                        for index, count in enumerate(class_counts)
                    },
                }
            )
        else:
            feature_index = int(tree.feature[node_id])
            nodes.append(
                {
                    "id": node_id,
                    "isLeaf": False,
                    "feature": FEATURE_COLUMNS[feature_index],
                    "threshold": round(float(tree.threshold[node_id]), 6),
                    "left": int(tree.children_left[node_id]),
                    "right": int(tree.children_right[node_id]),
                    "predictedClass": classes[predicted_index],
                    "probability": round(probability, 4),
                }
            )

    payload = {
        "modelType": "DecisionTreeClassifier",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "featureNames": FEATURE_COLUMNS,
        "labels": classes,
        "labelDisplayNames": CATEGORY_LABELS,
        "foodsCount": foods_count,
        "metrics": metrics,
        "nodes": nodes,
    }
    TREE_EXPORT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    foods = build_food_dataset()
    write_food_dataset(foods)

    data = generate_training_data(foods)
    train_df, test_df = train_test_split(
        data,
        test_size=0.22,
        random_state=42,
        stratify=data["category"],
    )

    model = train_model(train_df)
    predictions = model.predict(test_df[FEATURE_COLUMNS])
    accuracy = accuracy_score(test_df["category"], predictions)

    metrics = {
        "accuracy": round(float(accuracy), 4),
        "trainingSamples": int(len(train_df)),
        "testSamples": int(len(test_df)),
    }

    bundle = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "labels": CATEGORY_LABELS,
        "foods_path": str(FOODS_PATH.relative_to(PROJECT_ROOT)),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metrics": metrics,
    }
    joblib.dump(bundle, MODEL_PATH)
    export_tree(model, metrics, len(foods))

    print("Nutrition ML training complete")
    print(f"Foods generated: {len(foods)} -> {FOODS_PATH.relative_to(PROJECT_ROOT)}")
    print(f"Training rows: {len(train_df)} | Test rows: {len(test_df)}")
    print(f"Accuracy: {accuracy:.2%}")
    print(f"Saved model: {MODEL_PATH.relative_to(PROJECT_ROOT)}")
    print(f"Exported frontend tree: {TREE_EXPORT_PATH.relative_to(PROJECT_ROOT)}")
    print("\nClassification report:")
    print(classification_report(test_df["category"], predictions, zero_division=0))


if __name__ == "__main__":
    main()
