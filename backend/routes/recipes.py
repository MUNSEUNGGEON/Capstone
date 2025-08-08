from flask import Blueprint, request, jsonify
from models.user import get_db_connection, User
# 알레르기 맵핑 데이터
from utils.allergy import (
    allergy_synonyms,
    allergy_id_name_map,
    generate_recipe_allergy_filter_sql
)
recipes_bp = Blueprint('recipes', __name__)

# =========================
# 레시피 목록 조회 API
# =========================
@recipes_bp.route('/api/recipes', methods=['GET'])
def get_recipes():
    # 1. 쿼리 파라미터에서 사용자 ID와 체크된 알레르기 ID 리스트 추출
    user_id = request.args.get('user_id', type=int)
    checked_allergies = request.args.get('checked_allergies')

    # 2. 체크된 알레르기 ID 파싱 (문자열 → 리스트)
    if checked_allergies:
        try:
            checked_allergy_ids = list(map(int, checked_allergies.split(',')))
            print("Checked allergy IDs:", checked_allergy_ids)
        except:
            return jsonify({'error': 'Invalid allergy ids'}), 400
    else:
        checked_allergy_ids = []

    # 3. DB에서 사용자 알레르기 정보 조회
    user_allergy_ids = User.get_user_allergies(user_id) if user_id else []
    print("User allergy IDs:", user_allergy_ids)

    # 4. 체크박스에서 선택한 항목만 사용자 알레르기에서 필터링
    effective_user_allergy_ids = [aid for aid in user_allergy_ids if aid in checked_allergy_ids]

    # 5. 사용자 알레르기와 체크된 알레르기 합치기 (중복 제거)
    combined_allergy_ids = list(set(effective_user_allergy_ids + checked_allergy_ids))
    print("Combined allergy IDs:", combined_allergy_ids)

    # 6. DB 연결 및 쿼리 실행
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 6-1. 기본 레시피 조회 SQL
            base_sql = """
                SELECT Food_id, Food_name, Food_role, Food_img, Food_materials
                FROM food r
            """

            # 6-2. 알레르기 필터가 있으면 WHERE 절 추가
            if combined_allergy_ids:
                allergy_filter = generate_recipe_allergy_filter_sql(combined_allergy_ids)
                if allergy_filter:
                    base_sql += f" WHERE {allergy_filter}"

            # 6-3. 조회수 기준 내림차순 정렬
            base_sql += " ORDER BY r.view_count DESC"

            # 6-4. 레시피 목록 조회
            cursor.execute(base_sql)
            foods = cursor.fetchall()

            result = []

            # 6-5. 각 레시피별로 대표 조리법 1개 추가 조회
            for food in foods:
                cursor.execute("""
                    SELECT Food_cooking_method
                    FROM food_cooking
                    WHERE Food_id = %s
                    ORDER BY Food_cooking_id
                    LIMIT 1
                """, (food['Food_id'],))
                cooking_row = cursor.fetchone()

                food_data = {
                    'Food_id': food['Food_id'],
                    'Food_name': food['Food_name'],
                    'Food_role': food['Food_role'],
                    'Food_img': food['Food_img'],
                    'Food_materials': food['Food_materials'],
                    'Food_cooking_method': cooking_row['Food_cooking_method'] if cooking_row else ''
                }

                result.append(food_data)

            # 7. 결과 반환
            return jsonify(result)
    except Exception as e:
        print("Error in /api/recipes:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()


# =========================
# 레시피 상세 정보 조회 API
# =========================
@recipes_bp.route('/api/recipes/<food_id>', methods=['GET'])
def get_recipe_detail(food_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. 조회수 증가
            cursor.execute("""
                UPDATE food
                SET view_count = view_count + 1
                WHERE Food_id = %s
            """, (food_id,))
            connection.commit()

            # 2. 레시피 상세 정보 조회
            cursor.execute("""
                SELECT Food_id, Food_name, Food_img, Food_materials, Food_role
                FROM food
                WHERE Food_id = %s
            """, (food_id,))
            
            recipe = cursor.fetchone()
            
            if not recipe:
                return jsonify({'error': 'Recipe not found'}), 404
            
            # 3. (예시) allergy_ids 필드 추가 (실제 알레르기 정보 필요시 수정)
            recipe['allergy_ids'] = ''
            
            return jsonify(recipe)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# =========================
# 레시피 조리법 조회 API
# =========================
@recipes_bp.route('/api/recipes/<food_id>/cooking', methods=['GET'])
def get_recipe_cooking(food_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. 해당 레시피의 모든 조리법 및 이미지 조회
            cursor.execute("""
                SELECT Food_cooking_method, Food_cooking_image
                FROM food_cooking
                WHERE Food_id = %s
                ORDER BY Food_cooking_id
            """, (food_id,))
            
            cooking_data = cursor.fetchall()
            return jsonify(cooking_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# =========================
# 레시피 조회수 증가 API
# =========================
@recipes_bp.route('/api/recipe/<int:Food_id>/view', methods=['POST'])
def increase_view_count(Food_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. 해당 레시피의 조회수 1 증가
            cursor.execute("""
                UPDATE food 
                SET view_count = COALESCE(view_count, 0) + 1 
                WHERE Food_id = %s
            """, (Food_id,))
            connection.commit()
            
            return jsonify({'message': 'View count increased successfully'}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()