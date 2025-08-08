from config import get_db_connection  # DB 연결 함수

class MealNutrition:
    """
    meal_nutrition 테이블에 데이터를 저장/조회/삭제하는 클래스.
    """
    def __init__(self, meal_id, total_calories, total_carbohydrate, total_protein, total_fat, total_sodium):
        self.meal_id = meal_id
        self.total_calories = total_calories
        self.total_carbohydrate = total_carbohydrate
        self.total_protein = total_protein
        self.total_fat = total_fat
        self.total_sodium = total_sodium

    def save(self, external_conn=None):
        """
        영양소 데이터를 데이터베이스에 저장합니다.
        외부에서 커넥션을 넘기면 그 커넥션을 사용하고, 아니면 새로 커넥션을 생성합니다.
        """
        # external_conn이 있으면 그걸 사용, 없으면 새로 생성
        conn = external_conn if external_conn else get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO meal_nutrition
                (meal_id, total_calories, total_carbohydrate, total_protein, total_fat, total_sodium)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    total_calories = VALUES(total_calories),
                    total_carbohydrate = VALUES(total_carbohydrate),
                    total_protein = VALUES(total_protein),
                    total_fat = VALUES(total_fat),
                    total_sodium = VALUES(total_sodium)
            """, (
                self.meal_id,
                float(self.total_calories),
                float(self.total_carbohydrate),
                float(self.total_protein),
                float(self.total_fat),
                float(self.total_sodium)
            ))
            conn.commit()
        finally:
            cursor.close()
            if not external_conn:
                conn.close()

    @staticmethod
    def get_by_meal_id(meal_id):
        """
        특정 meal_id의 영양소 총합 데이터를 MealNutrition 객체로 반환합니다.
        """
        conn = get_db_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("""
                    SELECT * FROM meal_nutrition WHERE meal_id = %s
                """, (meal_id,))
                row = cursor.fetchone()
                if row:
                    return MealNutrition(
                        meal_id=row['meal_id'],
                        total_calories=row['total_calories'],
                        total_carbohydrate=row['total_carbohydrate'],
                        total_protein=row['total_protein'],
                        total_fat=row['total_fat'],
                        total_sodium=row['total_sodium']
                    )
                else:
                    return None
        finally:
            conn.close()

    @staticmethod
    def delete_by_meal_id(meal_id):
        """
        특정 meal_id의 영양소 총합 데이터를 삭제합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM meal_nutrition WHERE meal_id = %s", (meal_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        """
        모든 식단 영양소 정보를 MealNutrition 객체 리스트로 반환합니다.
        """
        conn = get_db_connection()
        try:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT * FROM meal_nutrition")
                rows = cursor.fetchall()
                return [MealNutrition(
                    meal_id=row['meal_id'],
                    total_calories=row['total_calories'],
                    total_carbohydrate=row['total_carbohydrate'],
                    total_protein=row['total_protein'],
                    total_fat=row['total_fat'],
                    total_sodium=row['total_sodium']
                ) for row in rows]
        finally:
            conn.close()

def get_meal_nutrition(meal_id):
    """
    특정 meal_id의 영양소 총합 데이터를 dict로 반환합니다.
    """
    obj = MealNutrition.get_by_meal_id(meal_id)
    if obj is None:
        return {
            'total_calories': 0,
            'total_carbohydrate': 0,
            'total_protein': 0,
            'total_fat': 0,
            'total_sodium': 0
        }
    return {
        'total_calories': obj.total_calories,
        'total_carbohydrate': obj.total_carbohydrate,
        'total_protein': obj.total_protein,
        'total_fat': obj.total_fat,
        'total_sodium': obj.total_sodium
    }

def get_meal_with_nutrition_by_user_id_and_date(user_id, start_date, end_date):
    """
    특정 사용자(user_id)와 날짜 범위(start_date, end_date)에 해당하는 식사(meal)와 영양소 정보를 조회합니다.
    """
    conn = get_db_connection()
    try:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT m.*, mn.total_calories, mn.total_carbohydrate, mn.total_protein, mn.total_fat, mn.total_sodium
                FROM meal m
                LEFT JOIN meal_nutrition mn ON m.Meal_id = mn.meal_id
                WHERE m.user_id = %s AND m.date BETWEEN %s AND %s
            """, (user_id, start_date, end_date))
            rows = cursor.fetchall()
            return [{
                'meal_id': row['meal_id'],
                'user_id': row['user_id'],
                'date': row['date'],
                'total_calories': row['total_calories'] if row['total_calories'] is not None else 0,
                'total_carbohydrate': row['total_carbohydrate'] if row['total_carbohydrate'] is not None else 0,
                'total_protein': row['total_protein'] if row['total_protein'] is not None else 0,
                'total_fat': row['total_fat'] if row['total_fat'] is not None else 0,
                'total_sodium': row['total_sodium'] if row['total_sodium'] is not None else 0
            } for row in rows]
    finally:
            conn.close()
        
