from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.register import register_bp  # 파일명 변경에 따라 import 경로 수정
from routes.meal import meal_bp
from routes.food import food_bp
from routes.growth import growth_bp
from routes.products import products_bp
from routes.recipes import recipes_bp
from routes.food_nutrition import food_nutrition_bp
from routes.meal_nutrition import meal_nutrition_bp
from routes.recommended_meal import recommended_meal_bp
from routes.user import user_bp  # 사용자 라우트 추가
from routes.orders import orders_bp  # 주문 라우트 추가
from config import test_db_connection

app = Flask(__name__)

# CORS 설정 개선
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Blueprint 등록
app.register_blueprint(auth_bp)
app.register_blueprint(register_bp)
app.register_blueprint(meal_bp)
app.register_blueprint(food_bp)
app.register_blueprint(growth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(recipes_bp)
app.register_blueprint(food_nutrition_bp)
app.register_blueprint(meal_nutrition_bp)
app.register_blueprint(recommended_meal_bp)
app.register_blueprint(user_bp)  # 사용자 라우트 등록
app.register_blueprint(orders_bp)  # 주문 라우트 등록

if __name__ == '__main__':
    print("서버 시작 중...")
    
    # 데이터베이스 연결 테스트
    db_conn_success = test_db_connection()
    if db_conn_success:
        print("데이터베이스 연결 확인됨. 서버를 시작합니다.")
    else:
        print("경고: 데이터베이스 연결에 실패했지만 서버를 시작합니다.")
        print("실제 요청 시 데이터베이스 오류가 발생할 수 있습니다.")
    
    app.run(debug=True, port=5000)
