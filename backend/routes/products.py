from flask import Blueprint, request, jsonify
from models.user import get_db_connection, User
# 알레르기 맵핑 데이터
from utils.allergy import (
    allergy_synonyms,
    allergy_id_name_map,
    generate_product_allergy_filter_sql
)
products_bp = Blueprint('products', __name__)

# =========================
# 상품 목록 조회 API
# =========================
@products_bp.route('/api/products', methods=['GET'])
def get_all_products():
    # 1. 쿼리 파라미터로 체크된 알레르기 id 리스트를 콤마로 받음 (ex: checked_allergies=1,10,15)
    user_id = request.args.get('user_id', type=int)
    checked_allergies = request.args.get('checked_allergies')  # str or None

    # 2. 프론트에서 체크한 알레르기 파싱 (문자열 → 리스트)
    if checked_allergies:
        try:
            checked_allergy_ids = list(map(int, checked_allergies.split(',')))
            print("Checked allergy IDs:", checked_allergy_ids)
        except:
            return jsonify({'error': 'Invalid allergy ids'}), 400
    else:
        checked_allergy_ids = []

    # 3. DB에서 사용자 알레르기 정보 조회 (user_allergy 테이블)
    user_allergy_ids = User.get_user_allergies(user_id) if user_id else []
    print("User allergy IDs:", user_allergy_ids)

    # 4. 두 알레르기 리스트 합치기 (중복 제거)
    combined_allergy_ids = list(set(user_allergy_ids + checked_allergy_ids))
    print("Combined allergy IDs:", combined_allergy_ids)

    # 5. DB 연결 및 상품 목록 쿼리 실행
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            base_sql = "SELECT * FROM products p"
            # 6. 알레르기 필터가 있으면 WHERE 절 추가
            if combined_allergy_ids:
                allergy_filter = generate_product_allergy_filter_sql(combined_allergy_ids, table_alias='p')
                if allergy_filter:
                    base_sql += f" WHERE {allergy_filter}"

            # 7. 조회수 기준 내림차순 정렬
            base_sql += " ORDER BY p.view_count DESC"
            cursor.execute(base_sql)

            # 8. 상품 목록 결과 반환
            products = cursor.fetchall()
            return jsonify(products)

    except Exception as e:
        print("Error in /api/products:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# =========================
# 상품 상세 정보 조회 API
# =========================
@products_bp.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. 해당 상품의 조회수 1 증가
            update_sql = "UPDATE products SET view_count = view_count + 1 WHERE product_id = %s"
            cursor.execute(update_sql, (product_id,))
            connection.commit()

            # 2. 상품 상세 정보 조회
            sql = "SELECT * FROM products WHERE product_id = %s"
            cursor.execute(sql, (product_id,))
            product = cursor.fetchone()

            if not product:
                return jsonify({'error': 'Product not found'}), 404

            # 3. 상품 이미지 리스트 조회
            sql_images = "SELECT image_url FROM product_images WHERE product_id = %s"
            cursor.execute(sql_images, (product_id,))
            images = cursor.fetchall()
            product['images'] = [img['image_url'] for img in images]

            # 4. 상세 정보 반환
            return jsonify(product)
    finally:
        connection.close()

# =========================
# 사용자 알레르기 정보 조회 API (프론트에서 별도 호출용)
# =========================
@products_bp.route('/api/user_allergies/<int:user_id>', methods=['GET'])
def get_user_allergies(user_id):
    try:
        # 1. User 클래스의 메서드로 알레르기 ID 리스트 조회
        allergy_ids = User.get_user_allergies(user_id)
        # 2. 결과 반환
        return jsonify(allergy_ids)
    except Exception as e:
        return jsonify({'error': str(e)}), 500