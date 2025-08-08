import pymysql
from config import DB_CONFIG

def get_db_connection():
    """데이터베이스 연결을 생성하고 반환"""
    return pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        port=DB_CONFIG['port'],
        charset=DB_CONFIG['charset'],
        cursorclass=pymysql.cursors.DictCursor
    )

class User:
    def __init__(self, id=None, username=None, password=None, name=None, 
                 email=None, phone_number=None, register_date=None):
        self.id = id  # User_id (PK)
        self.username = username  # id (로그인용 아이디)
        self.password = password
        self.name = name
        self.email = email
        self.phone_number = phone_number
        self.register_date = register_date
    
    @staticmethod
    def get_by_id(user_id):
        """
        사용자 ID(PK)로 사용자 정보를 조회합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM User WHERE User_id = %s", (user_id,))
            user = cursor.fetchone()
            return user
        except Exception as e:
            print(f"사용자 조회 오류: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def get_by_username(username):
        """
        로그인 아이디로 사용자 정보를 조회합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM User WHERE id = %s", (username,))
            user = cursor.fetchone()
            return user
        except Exception as e:
            print(f"사용자 조회 오류: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
            
    @staticmethod
    def get_user_allergies(user_id):
        """
        사용자 ID로 알레르기 ID 리스트를 조회합니다.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT Allerg_id FROM user_allergy WHERE User_id = %s", (user_id,))
            rows = cursor.fetchall()
            return [row['Allerg_id'] for row in rows]
        except Exception as e:
            print(f"알레르기 정보 조회 오류: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
