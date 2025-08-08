import datetime
import random
import traceback
from services.meal_filter import filter_foods_by_allergy
from models.meal import Meal
from services.meal_nutrition import save_meal_total_nutrition

def generate_daily_meal(user_id, date=None):
    """
    사용자 맞춤 하루 식단을 생성하고, 식단 영양소도 저장합니다.
    """
    if date is None:
        date = datetime.date.today()

    try:
        print(f"🌟 하루 식단 생성: user_id={user_id}, date={date}")

        # ✅ 1️⃣ 사용자 알러지 기반 음식 데이터 필터링
        filtered_foods = filter_foods_by_allergy(user_id)

        # ✅ 2️⃣ 카테고리별 음식 분류
        rice_list = [f for f in filtered_foods if f['Food_role'] == '밥']
        soup_list = [f for f in filtered_foods if f['Food_role'] == '국&찌개']
        side_dishes_list = [f for f in filtered_foods if f['Food_role'] == '반찬']
        main_dish_list = [f for f in filtered_foods if f['Food_role'] == '일품']
        dessert_list = [f for f in filtered_foods if f['Food_role'] == '후식']

        # ✅ 3️⃣ 랜덤으로 음식 선택
        rice = random.choice(rice_list) if rice_list else None
        soup = random.choice(soup_list) if soup_list else None
        side_dishes = random.sample(side_dishes_list, min(2, len(side_dishes_list))) if side_dishes_list else []
        main_dish = random.choice(main_dish_list) if main_dish_list else None
        dessert = random.choice(dessert_list) if dessert_list else None

        print(f"  🍚 선택 결과: rice={rice['Food_id'] if rice else None}, "
              f"soup={soup['Food_id'] if soup else None}, "
              f"side_dishes={[d['Food_id'] for d in side_dishes] if side_dishes else []}, "
              f"main_dish={main_dish['Food_id'] if main_dish else None}, "
              f"dessert={dessert['Food_id'] if dessert else None}")

        # ✅ 4️⃣ 각 항목의 음식 ID
        rice_id = rice['Food_id'] if rice else None
        soup_id = soup['Food_id'] if soup else None
        main_dish_id = main_dish['Food_id'] if main_dish else None
        dessert_id = dessert['Food_id'] if dessert else None
        side_dish1_id = side_dishes[0]['Food_id'] if len(side_dishes) > 0 else None
        side_dish2_id = side_dishes[1]['Food_id'] if len(side_dishes) > 1 else None

        # ✅ 5️⃣ Meal 객체 생성 및 저장
        meal = Meal(
            User_id=user_id,
            Date=date,
            Rice_id=rice_id,
            Soup_id=soup_id,
            SideDish1_id=side_dish1_id,
            SideDish2_id=side_dish2_id,
            MainDish_id=main_dish_id,
            Dessert_id=dessert_id
        )
        print("  📝 식단 저장 중...")
        meal_id = meal.save()
        print(f"  ✅ 식단 저장 완료: meal_id={meal_id}")

        # ✅ 6️⃣ 음식 ID 리스트로 영양소 총합 저장
        food_ids = [f['Food_id'] for f in [rice, soup, main_dish, dessert] + side_dishes if f]
        save_meal_total_nutrition(meal_id, food_ids)

        return meal_id

    except Exception as e:
        print(f"❌ 하루 식단 생성 오류: {e}")
        traceback.print_exc()
        return None
