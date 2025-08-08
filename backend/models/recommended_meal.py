from config import get_db_connection


class RecommendedMeal:
    """권장 영양소 데이터를 데이터베이스에서 조회하는 클래스."""

    @staticmethod
    def get_by_age(age: int):
        """주어진 나이에 해당하는 권장 영양소 데이터를 데이터베이스에서 조회."""
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                """
                SELECT
                    Recommended_calories AS calories,
                    Recommended_carbohydrate AS carbohydrate,
                    Recommended_protein AS protein,
                    Recommended_fat AS fat,
                    Recommended_sodium AS sodium
                FROM Recommended_meal
                WHERE age = %s
                LIMIT 1
                """,
                (age,)
            )
            row = cursor.fetchone()
            return row
        finally:
            cursor.close()
            conn.close()
