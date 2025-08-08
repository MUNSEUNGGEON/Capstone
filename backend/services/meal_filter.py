from config import get_db_connection  # DB 연결 함수를 가져옴
from models.user import User  # ✅ 사용자 알러지 정보 불러오기
from utils.allergy import generate_recipe_allergy_filter_sql

def filter_foods_by_allergy(user_id):
    """
    사용자의 알러지 정보를 기반으로 음식 데이터를 필터링하여 반환.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        print("\n" + "="*50)
        print(f"🟢 [filter_foods_by_allergy] 함수 실행 - user_id: {user_id}")

        # ✅ 알러지 ID 정확히 컬럼명 맞추기!
        cursor.execute("SELECT Allerg_id FROM User_Allergy WHERE User_id = %s", (user_id,))
        allergy_rows = cursor.fetchall()
        allergy_ids = [row['Allerg_id'] for row in allergy_rows]

        if not allergy_ids:
            print("🔵 사용자 알러지 정보가 없어서 전체 음식 반환")
            cursor.execute("SELECT * FROM Food")
            foods = cursor.fetchall()
            print(f"🔵 전체 음식 개수: {len(foods)}")
            print("="*50 + "\n")
            return foods

        print(f"🟢 사용자 알러지 ID: {allergy_ids}")

        allergy_filter_sql = generate_recipe_allergy_filter_sql(allergy_ids, table_alias='f')

        if not allergy_filter_sql:
            print("🔵 인식된 알러지 조건이 없어 전체 음식 반환")
            cursor.execute("SELECT * FROM Food")
        else:
            sql = f"SELECT * FROM Food AS f WHERE {allergy_filter_sql}"
            cursor.execute(sql)
        foods = cursor.fetchall()
        print(f"🟢 알러지 제외 후 남은 음식 개수: {len(foods)}")
        print("="*50 + "\n")

        return foods

    finally:
        cursor.close()
        conn.close()
