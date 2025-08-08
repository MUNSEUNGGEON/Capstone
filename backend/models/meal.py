from config import get_db_connection  # DB 연결 함수를 가져옴
import datetime

class Meal:
    # ============================================
    # [1] 클래스 초기화
    # ============================================
    def __init__(self, Meal_id=None, User_id=None, Date=None, Rice_id=None, Soup_id=None, 
                 SideDish1_id=None, SideDish2_id=None, MainDish_id=None, Dessert_id=None):
        self.Meal_id = Meal_id                  # 식단 ID
        self.User_id = User_id                  # 사용자 ID
        self.Date = Date                        # 식단 날짜
        self.Rice_id = Rice_id                  # 밥 ID
        self.Soup_id = Soup_id                  # 국 ID
        self.SideDish1_id = SideDish1_id        # 반찬1 ID
        self.SideDish2_id = SideDish2_id        # 반찬2 ID
        self.MainDish_id = MainDish_id          # 메인 요리 ID
        self.Dessert_id = Dessert_id            # 디저트 ID

    # ============================================
    # [2] 식단 저장 (새로 생성하거나 업데이트)
    # ============================================
    def save(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if self.Meal_id:
            # (2-1) 기존 식단 업데이트
            sql = """
                UPDATE Meal 
                SET User_id=%s, Date=%s, Rice_id=%s, Soup_id=%s, 
                    SideDish1_id=%s, SideDish2_id=%s, MainDish_id=%s, Dessert_id=%s
                WHERE Meal_id=%s
            """
            cursor.execute(sql, (
                self.User_id, self.Date, self.Rice_id, self.Soup_id, 
                self.SideDish1_id, self.SideDish2_id, self.MainDish_id, self.Dessert_id,
                self.Meal_id
            ))
        else:
            # (2-2) 새로운 식단 추가
            sql = """
                INSERT INTO Meal (User_id, Date, Rice_id, Soup_id, SideDish1_id, SideDish2_id, MainDish_id, Dessert_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                self.User_id, self.Date, self.Rice_id, self.Soup_id, 
                self.SideDish1_id, self.SideDish2_id, self.MainDish_id, self.Dessert_id
            ))
            self.Meal_id = cursor.lastrowid  # 새로 추가된 식단의 ID 반환
            
        conn.commit()  # DB에 적용
        cursor.close()
        conn.close()
        return self.Meal_id  # 식단 ID 반환

    # ============================================
    # [3] 특정 사용자+날짜의 식단 정보 조회
    # ============================================
    @staticmethod
    def get_by_user_and_date(user_id, date):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        sql = """
            SELECT m.*, 
                r.Food_name as rice_name, r.Food_img as rice_image,
                s.Food_name as soup_name, s.Food_img as soup_image,
                sd1.Food_name as side_dish1_name, sd1.Food_img as side_dish1_image,
                sd2.Food_name as side_dish2_name, sd2.Food_img as side_dish2_image,
                md.Food_name as main_dish_name, md.Food_img as main_dish_image,
                d.Food_name as dessert_name, d.Food_img as dessert_image
            FROM Meal m
            LEFT JOIN Food r ON m.Rice_id = r.Food_id
            LEFT JOIN Food s ON m.Soup_id = s.Food_id
            LEFT JOIN Food sd1 ON m.SideDish1_id = sd1.Food_id
            LEFT JOIN Food sd2 ON m.SideDish2_id = sd2.Food_id
            LEFT JOIN Food md ON m.MainDish_id = md.Food_id
            LEFT JOIN Food d ON m.Dessert_id = d.Food_id
            WHERE m.User_id = %s AND m.Date = %s
        """
        cursor.execute(sql, (user_id, date))
        meal = cursor.fetchone()  # 첫 번째 결과 가져오기
        
        cursor.close()
        conn.close()
        return meal  # 식단 정보 반환

    # ============================================
    # [4] 특정 사용자의 월별 식단 목록 조회
    # ============================================
    @staticmethod
    def get_monthly_meals(user_id, year, month):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # (4-1) 해당 월의 첫 날과 마지막 날 계산
        first_day = datetime.date(year, month, 1)
        if month == 12:
            last_day = datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
        else:
            last_day = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
        
        # (4-2) 월별 식단 정보 조회
        sql = """
            SELECT m.*, DATE_FORMAT(m.Date, '%Y-%m-%d') as formatted_date,
                r.Food_name as rice_name, r.Food_img as rice_image,
                s.Food_name as soup_name, s.Food_img as soup_image,
                sd1.Food_name as side_dish1_name, sd1.Food_img as side_dish1_image,
                sd2.Food_name as side_dish2_name, sd2.Food_img as side_dish2_image,
                md.Food_name as main_dish_name, md.Food_img as main_dish_image,
                d.Food_name as dessert_name, d.Food_img as dessert_image
            FROM Meal m
            LEFT JOIN Food r ON m.Rice_id = r.Food_id
            LEFT JOIN Food s ON m.Soup_id = s.Food_id
            LEFT JOIN Food sd1 ON m.SideDish1_id = sd1.Food_id
            LEFT JOIN Food sd2 ON m.SideDish2_id = sd2.Food_id
            LEFT JOIN Food md ON m.MainDish_id = md.Food_id
            LEFT JOIN Food d ON m.Dessert_id = d.Food_id
            WHERE m.User_id = %s AND m.Date BETWEEN %s AND %s
            ORDER BY m.Date
        """
        cursor.execute(sql, (user_id, first_day, last_day))
        meals = cursor.fetchall()  # 모든 식단 정보 가져오기
        
        cursor.close()
        conn.close()
        
        # (4-3) 날짜별로 딕셔너리 형태로 정리
        meal_dict = {}
        for meal in meals:
            formatted_date = meal['formatted_date']
            meal_dict[formatted_date] = meal
            
        return meal_dict  # 월별 식단 정보 딕셔너리 반환

    # ============================================
    # [5] 특정 사용자+날짜의 식단 삭제
    # ============================================
    @staticmethod
    def delete_by_user_and_date(user_id, date):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "DELETE FROM Meal WHERE User_id = %s AND Date = %s"
        cursor.execute(sql, (user_id, date))
        
        conn.commit()  # 삭제 내용 적용
        cursor.close()
        conn.close()
        return cursor.rowcount > 0  # 삭제된 행이 있으면 True 반환
