from config import get_db_connection  # DB 연결 함수

class FoodNutrition:
    """
    food_nutrition 테이블의 영양소 정보를 나타내는 클래스.
    """
    def __init__(self, food_id, calories, carbohydrate, protein, fat, sodium):
        self.food_id = food_id
        self.calories = calories
        self.carbohydrate = carbohydrate
        self.protein = protein
        self.fat = fat
        self.sodium = sodium

    def save(self):
        """
        food_nutrition 테이블에 영양소 데이터를 저장합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO food_nutrition
                (Food_id, calories, carbohydrate, protein, fat, sodium)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    calories = VALUES(calories),
                    carbohydrate = VALUES(carbohydrate),
                    protein = VALUES(protein),
                    fat = VALUES(fat),
                    sodium = VALUES(sodium)
            """, (
                self.food_id,
                self.calories,
                self.carbohydrate,
                self.protein,
                self.fat,
                self.sodium
            ))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @classmethod
    def get_by_food_id(cls, food_id):
        """
        특정 food_id의 영양소 정보를 FoodNutrition 객체로 반환합니다.
        """
        conn = get_db_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                sql = "SELECT * FROM food_nutrition WHERE Food_id = %s"
                cursor.execute(sql, (food_id,))
                rows = cursor.fetchall()  # 모든 결과를 소진
                if rows:
                    row = rows[0]
                    return FoodNutrition(
                        food_id=row['Food_id'],
                        calories=row['calories'],
                        carbohydrate=row['carbohydrate'],
                        protein=row['protein'],
                        fat=row['fat'],
                        sodium=row['sodium']
                    )
                else:
                    return None
        finally:
            conn.close()

    @staticmethod
    def delete_by_food_id(food_id):
        """
        특정 food_id의 영양소 정보를 삭제합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM food_nutrition WHERE Food_id = %s", (food_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        """
        모든 영양소 정보를 FoodNutrition 객체 리스트로 반환합니다.
        """
        conn = get_db_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM food_nutrition")
                rows = cursor.fetchall()
                return [FoodNutrition(
                    food_id=row['Food_id'],
                    calories=row['calories'],
                    carbohydrate=row['carbohydrate'],
                    protein=row['protein'],
                    fat=row['fat'],
                    sodium=row['sodium']
                ) for row in rows]
        finally:
            conn.close()

# 기존 함수 유지 (호환성 위해)
def get_nutrition_by_food_id(food_id):
    """
    특정 food_id의 영양소 정보를 dict로 반환합니다.
    """
    obj = FoodNutrition.get_by_food_id(food_id)
    if obj is None:
        return {
            'calories': 0,
            'carbohydrate': 0,
            'protein': 0,
            'fat': 0,
            'sodium': 0
        }
    return {
        'calories': obj.calories,
        'carbohydrate': obj.carbohydrate,
        'protein': obj.protein,
        'fat': obj.fat,
        'sodium': obj.sodium
    }
