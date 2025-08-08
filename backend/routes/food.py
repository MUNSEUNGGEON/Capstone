from flask import Blueprint, jsonify
from models.food import Food
from utils.auth import token_required
from config import get_db_connection

food_bp = Blueprint('food', __name__)

@food_bp.route('/api/food/<food_id>', methods=['GET'])
@token_required
def get_food_detail(current_user, food_id):
    """
    음식의 상세 정보(재료, 조리법)를 가져옵니다.
    """
    conn = None
    food_result = None
    cooking_result = None
    products_result = None
    
    try:
        # food_id가 숫자로만 구성되어 있으면 FD 접두사 추가
        if food_id.isdigit():
            formatted_food_id = f"FD{food_id}"
        else:
            # 이미 문자열 형식(FD로 시작)이면 그대로 사용
            formatted_food_id = food_id
            
        print(f"조회할 Food_id: {formatted_food_id}")
        
        # 음식 정보는 가져오기
        food = Food.get_by_id(formatted_food_id)
        
        if not food:
            return jsonify({
                'success': False,
                'message': '해당 음식 정보가 없습니다.'
            }), 404
            
        # 새로운 DB 연결 생성
        conn = get_db_connection()
        
        # 조리법 가져오기 
        cooking_cursor = conn.cursor(dictionary=True, buffered=True)
        cooking_cursor.execute("""
            SELECT * FROM Food_cooking 
            WHERE Food_id = %s
        """, (formatted_food_id,))
        
        cooking_info = None
        if cooking_cursor.with_rows:
            cooking_info = cooking_cursor.fetchone()
        
        # 커서 닫기
        cooking_cursor.close()
        
        # 관련 상품 가져오기
        related_products = []
        
        if food.get('Food_materials'):
            materials = food['Food_materials'].split(',')
            # 재료 이름에서 재료 키워드 추출
            material_keywords = [m.strip().split(' ')[0] for m in materials if m.strip()]
            
            if material_keywords and len(material_keywords) > 0:
                # 재료 키워드에 기반한 LIKE 쿼리 생성
                like_clauses = ' OR '.join([f"food_products LIKE %s" for _ in material_keywords])
                params = [f"%{keyword}%" for keyword in material_keywords]
                
                # 관련 상품 조회 쿼리
                products_query = f"""
                    SELECT product_id, food_products, category, price, img 
                    FROM products 
                    WHERE {like_clauses}
                    LIMIT 6
                """
                
                # 버퍼링된 결과를 사용하는 새 커서
                products_cursor = conn.cursor(dictionary=True, buffered=True)
                products_cursor.execute(products_query, params)
                
                # 결과 가져오기
                if products_cursor.with_rows:
                    related_products = products_cursor.fetchall() or []
                
                # 커서 닫기
                products_cursor.close()
        
        # 결과 반환
        return jsonify({
            'success': True,
            'food': food,
            'cooking': cooking_info,
            'related_products': related_products
        })
        
    except Exception as e:
        print(f"음식 상세 정보 조회 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'음식 정보를 가져오는 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        # 연결이 있으면 반드시 닫기
        if conn:
            try:
                conn.close()
            except Exception as e:
                print(f"DB 연결 닫기 오류: {str(e)}") 