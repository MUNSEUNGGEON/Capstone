import os
from dotenv import load_dotenv
import mysql.connector

# .env 파일 로드
load_dotenv()

# 데이터베이스 설정 (원격)
REMOTE_DB_CONFIG = {
    'host': '121.124.22.153',
    'user': 'root',
    'password': 'capstone',
    'database': 'test',
    'port': 3306,
    'charset': 'utf8mb4',
    'use_pure': True,  # 순수 Python 구현 사용
    'ssl_ca': None  # SSL 인증서 요구하지 않음
}

# 데이터베이스 설정 (로컬)
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',  # 로컬 MySQL 비밀번호로 변경하세요
    'database': 'test',
    'port': 3306,
    'charset': 'utf8mb4'
}

# 사용할 DB 설정 (로컬 또는 원격)
DB_CONFIG = REMOTE_DB_CONFIG  # 원격 DB 사용

# JWT 설정
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-for-jwt')

# 이메일 설정
EMAIL_CONFIG = {
    'sender_email': os.environ.get("EMAIL_SENDER", "sender@example.com"),
    'sender_password': os.environ.get("EMAIL_PASSWORD", "password"),
    'email_provider': os.environ.get("EMAIL_PROVIDER", "gmail").lower()
}

# SMTP 서버 설정
SMTP_SETTINGS = {
    "gmail": {
        "host": "smtp.gmail.com",
        "port": 465,
        "use_ssl": True
    },
    "naver": {
        "host": "smtp.naver.com",
        "port": 465,
        "use_ssl": True
    },
    "daum": {
        "host": "smtp.daum.net",
        "port": 465,
        "use_ssl": True
    },
    "outlook": {
        "host": "smtp-mail.outlook.com",
        "port": 587,
        "use_ssl": False
    },
    "yahoo": {
        "host": "smtp.mail.yahoo.com",
        "port": 465, 
        "use_ssl": True
    }
}

# 데이터베이스 연결 함수
def get_db_connection():
    try:
        conn_params = {
            'host': DB_CONFIG['host'],
            'user': DB_CONFIG['user'],
            'password': DB_CONFIG['password'],
            'database': DB_CONFIG['database'],
            'port': DB_CONFIG['port']
        }
        
        # 필요한 추가 옵션
        if 'use_pure' in DB_CONFIG:
            conn_params['use_pure'] = DB_CONFIG['use_pure']
        if 'ssl_ca' in DB_CONFIG:
            conn_params['ssl_ca'] = DB_CONFIG['ssl_ca']
            
        conn = mysql.connector.connect(**conn_params)
        return conn
    except mysql.connector.Error as err:
        print(f"DB 연결 오류: {err}")
        raise

# DB 연결 테스트 함수
def test_db_connection():
    try:
        conn = get_db_connection()
        if conn.is_connected():
            print("데이터베이스 연결 성공")
            db_info = conn.get_server_info()
            print(f"MySQL 서버 버전: {db_info}")
            
            cursor = conn.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()[0]
            print(f"현재 데이터베이스: {db_name}")
            
            cursor.close()
            conn.close()
            return True
        else:
            print("데이터베이스 연결 실패")
            return False
    except Exception as e:
        print(f"데이터베이스 연결 테스트 오류: {e}")
        return False

# JWT 시크릿 키 가져오는 함수
def get_jwt_secret_key():
    return JWT_SECRET_KEY 