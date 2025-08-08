from models.food_nutrition import FoodNutrition
from models.meal_nutrition import MealNutrition

def get_nutrition_by_food_id(food_id, external_cursor=None):
    """
    특정 food_id의 영양소 정보를 dict로 반환.
    외부에서 cursor를 넘겨주면 그것을 사용 (커서 닫기는 외부에서 처리).
    """
    cursor = external_cursor
    close_cursor = False

    if cursor is None:
        from config import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        close_cursor = True  # 새로 열었으면 닫아야 함

    cursor.execute("SELECT * FROM food_nutrition WHERE Food_id = %s", (food_id,))
    rows = cursor.fetchall()  # ✅ fetchall()로 결과를 다 읽어줌

    if close_cursor:
        cursor.close()
        conn.close()

    if rows:
        # 어차피 한 줄만 있을 테니 첫 번째 결과만 반환
        row = rows[0]
        return {
            'calories': row['calories'],
            'carbohydrate': row['carbohydrate'],
            'protein': row['protein'],
            'fat': row['fat'],
            'sodium': row['sodium']
        }
    else:
        return {
            'calories': 0,
            'carbohydrate': 0,
            'protein': 0,
            'fat': 0,
            'sodium': 0
        }


def save_meal_total_nutrition(meal_id, food_ids):
    """
    음식 ID 리스트를 받아서 식단의 총합 영양소를 계산 후 1/3로 나눠 저장.
    커넥션/커서를 한 번만 열고 재사용하여 Unread result 오류 방지.
    """
    from config import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        total_calories = total_carbohydrate = total_protein = total_fat = total_sodium = 0
        food_nutrition_list = []

        # 🔥 같은 커서를 재사용!
        for fid in food_ids:
            n = get_nutrition_by_food_id(fid, external_cursor=cursor)
            food_nutrition_list.append((fid, n))
            total_calories += n['calories']
            total_carbohydrate += n['carbohydrate']
            total_protein += n['protein']
            total_fat += n['fat']
            total_sodium += n['sodium']

        # 1/3로 나눠서 저장
        total_calories = round(total_calories / 3, 2)
        total_carbohydrate = round(total_carbohydrate / 3, 2)
        total_protein = round(total_protein / 3, 2)
        total_fat = round(total_fat / 3, 2)
        total_sodium = round(total_sodium / 3, 2)

        # MealNutrition 객체 생성 및 저장
        from models.meal_nutrition import MealNutrition
        meal_nutrition = MealNutrition(
            meal_id=meal_id,
            total_calories=total_calories,
            total_carbohydrate=total_carbohydrate,
            total_protein=total_protein,
            total_fat=total_fat,
            total_sodium=total_sodium
        )
        meal_nutrition.save(external_conn=conn)

        # 터미널 출력
        print(f"\n[식단 저장] meal_id={meal_id}")
        for fid, n in food_nutrition_list:
            print(f"  - Food_id={fid} | 칼로리={n['calories']} 탄수화물={n['carbohydrate']} 단백질={n['protein']} 지방={n['fat']} 나트륨={n['sodium']}")
        print(f"[식단 총합(1/3)] 칼로리={total_calories} 탄수화물={total_carbohydrate} 단백질={total_protein} 지방={total_fat} 나트륨={total_sodium}\n")
        print(f"✅ meal_id={meal_id}의 영양소 정보(1/3) 저장 완료!")
    finally:
        cursor.close()
        conn.close()
    return {
        'meal_id': meal_id,
        'total_calories': total_calories,
        'total_carbohydrate': total_carbohydrate,
        'total_protein': total_protein,
        'total_fat': total_fat,
        'total_sodium': total_sodium
    }