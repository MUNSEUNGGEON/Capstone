import datetime
import random
import numpy as np
from typing import Dict, List
from services.meal_filter import filter_foods_by_allergy
from services.meal_nutrition import save_meal_total_nutrition, get_nutrition_by_food_id
from models.meal import Meal
from models.food_embedding import get_embeddings


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    if a.size == 0 or b.size == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def refresh_daily_meal(user_id: int, date: datetime.date, target_nutrition: Dict[str, float], prev_food_ids: List[int] = None):
    """Generate a refreshed meal considering embeddings and nutrition."""
    if date is None:
        date = datetime.date.today()

    # Load candidate foods after allergy filtering
    foods = filter_foods_by_allergy(user_id)

    # Categorize foods by role
    rice_list = [f for f in foods if f['Food_role'] == '밥']
    soup_list = [f for f in foods if f['Food_role'] == '국&찌개']
    side_dishes_list = [f for f in foods if f['Food_role'] == '반찬']
    main_dish_list = [f for f in foods if f['Food_role'] == '일품']
    dessert_list = [f for f in foods if f['Food_role'] == '후식']

    # Previous meal food IDs
    if prev_food_ids is None:
        prev_meal = Meal.get_by_user_and_date(user_id, date)
        prev_food_ids = [
            prev_meal.get('Rice_id'), prev_meal.get('Soup_id'),
            prev_meal.get('SideDish1_id'), prev_meal.get('SideDish2_id'),
            prev_meal.get('MainDish_id'), prev_meal.get('Dessert_id')
        ] if prev_meal else []

    prev_embeds = list(get_embeddings(prev_food_ids).values())

    # Preload embeddings for all candidate foods
    candidate_ids = [f['Food_id'] for f in foods]
    candidate_embeddings = get_embeddings(candidate_ids)

    def random_combo():
        rice = random.choice(rice_list) if rice_list else None
        soup = random.choice(soup_list) if soup_list else None
        side_dishes = random.sample(side_dishes_list, min(2, len(side_dishes_list))) if side_dishes_list else []
        main_dish = random.choice(main_dish_list) if main_dish_list else None
        dessert = random.choice(dessert_list) if dessert_list else None
        return [rice, soup] + side_dishes + [main_dish, dessert]

    def score_combo(combo):
        food_ids = [f['Food_id'] for f in combo if f]
        # Similarity score
        sim = 0.0
        for fid in food_ids:
            emb = candidate_embeddings.get(fid)
            if emb is not None and prev_embeds:
                sim += max(cosine_sim(emb, p) for p in prev_embeds)
        # Nutrition difference
        totals = {'calories':0,'carbohydrate':0,'protein':0,'fat':0,'sodium':0}
        for fid in food_ids:
            n = get_nutrition_by_food_id(fid)
            for k in totals:
                totals[k] += n.get(k,0)
        diff = sum(abs(totals[k]-target_nutrition.get(k,0)) for k in totals)
        return sim + diff, totals, food_ids

    best = None
    best_totals = None
    best_ids = None
    best_score = float('inf')
    for _ in range(50):
        combo = random_combo()
        score, totals, ids = score_combo(combo)
        if score < best_score:
            best_score = score
            best = combo
            best_totals = totals
            best_ids = ids

    if not best:
        return None

    # Save meal
    rice = best[0]; soup = best[1]; side_dish1 = best[2] if len(best) > 2 else None
    side_dish2 = best[3] if len(best) > 3 else None
    main_dish = best[4] if len(best) > 4 else None
    dessert = best[5] if len(best) > 5 else None

    meal = Meal(
        User_id=user_id,
        Date=date,
        Rice_id=rice['Food_id'] if rice else None,
        Soup_id=soup['Food_id'] if soup else None,
        SideDish1_id=side_dish1['Food_id'] if side_dish1 else None,
        SideDish2_id=side_dish2['Food_id'] if side_dish2 else None,
        MainDish_id=main_dish['Food_id'] if main_dish else None,
        Dessert_id=dessert['Food_id'] if dessert else None,
    )
    meal_id = meal.save()

    nutrition_summary = save_meal_total_nutrition(meal_id, best_ids)
    return {'meal_id': meal_id, 'nutrition': nutrition_summary}


def refresh_meal_item(user_id: int, date: datetime.date, item_type: str, target_nutrition: Dict[str, float]):
    """Refresh a single menu item for the given day."""
    meal = Meal.get_by_user_and_date(user_id, date)
    if not meal:
        return None

    role_map = {
        'rice': ('Rice_id', '밥', 0),
        'soup': ('Soup_id', '국&찌개', 1),
        'side_dish1': ('SideDish1_id', '반찬', 2),
        'side_dish2': ('SideDish2_id', '반찬', 3),
        'main_dish': ('MainDish_id', '일품', 4),
        'dessert': ('Dessert_id', '후식', 5),
    }
    column_role = role_map.get(item_type)
    if not column_role:
        return None
    column, role, index = column_role
    prev_id = meal.get(column)

    foods = filter_foods_by_allergy(user_id)
    candidates = [f for f in foods if f['Food_role'] == role and f['Food_id'] != prev_id]
    if not candidates:
        return None

    prev_emb = get_embeddings([prev_id]).get(prev_id)
    cand_embeddings = get_embeddings([f['Food_id'] for f in candidates])

    meal_ids = [
        meal.get('Rice_id'), meal.get('Soup_id'), meal.get('SideDish1_id'),
        meal.get('SideDish2_id'), meal.get('MainDish_id'), meal.get('Dessert_id')
    ]

    best_id = None
    best_totals = None
    best_score = float('inf')
    for cand in candidates:
        fid = cand['Food_id']
        new_ids = meal_ids.copy()
        new_ids[index] = fid

        totals = {'calories': 0, 'carbohydrate': 0, 'protein': 0, 'fat': 0, 'sodium': 0}
        for i in new_ids:
            if i is None:
                continue
            n = get_nutrition_by_food_id(i)
            for k in totals:
                totals[k] += n.get(k, 0)

        diff = sum(abs(totals[k] - target_nutrition.get(k, 0)) for k in totals)
        emb = cand_embeddings.get(fid)
        sim = cosine_sim(emb, prev_emb) if emb is not None and prev_emb is not None else 0.0
        score = diff + sim
        if score < best_score:
            best_score = score
            best_id = fid
            best_totals = new_ids

    if best_id is None:
        return None

    meal_obj = Meal(
        Meal_id=meal['Meal_id'],
        User_id=user_id,
        Date=date,
        Rice_id=best_totals[0],
        Soup_id=best_totals[1],
        SideDish1_id=best_totals[2],
        SideDish2_id=best_totals[3],
        MainDish_id=best_totals[4],
        Dessert_id=best_totals[5],
    )
    meal_id = meal_obj.save()
    nutrition_summary = save_meal_total_nutrition(meal_id, [i for i in best_totals if i])
    return {'meal_id': meal_id, 'food_id': best_id, 'nutrition': nutrition_summary}
