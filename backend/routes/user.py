from flask import Blueprint, request, jsonify
from models.user import User
from utils.auth import token_required
from utils.password import hash_password
import pymysql
from config import DB_CONFIG            

user_bp = Blueprint('user', __name__)

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

@user_bp.route('/api/user/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    """사용자 프로필 정보 업데이트"""
    try:
        data = request.get_json()
        user_id = current_user['User_id']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 업데이트할 필드들
        update_fields = []
        update_values = []
        
        # 각 필드별로 업데이트 쿼리 구성
        if 'name' in data:
            update_fields.append("name = %s")
            update_values.append(data['name'])
            
        if 'email' in data:
            update_fields.append("email = %s")
            update_values.append(data['email'])
            
        if 'phone_number' in data:
            update_fields.append("phone_number = %s")
            update_values.append(data['phone_number'])
            
        if 'postal_address' in data:
            update_fields.append("postal_address = %s")
            update_values.append(data['postal_address'])

        if 'address' in data:
            update_fields.append("address = %s")
            update_values.append(data['address'])
        
        if 'address_detail' in data:
            update_fields.append("address_detail = %s")
            update_values.append(data['address_detail'])
            
        if 'kid_name' in data:
            update_fields.append("kid_name = %s")
            update_values.append(data['kid_name'])
            
        if 'kid_gender' in data:
            update_fields.append("kid_gender = %s")
            update_values.append(data['kid_gender'])
            
        if 'kid_birth' in data:
            update_fields.append("kid_birth = %s")
            update_values.append(data['kid_birth'])
        
        if update_fields:
            update_values.append(user_id)
            update_query = f"UPDATE User SET {', '.join(update_fields)} WHERE User_id = %s"
            
            cursor.execute(update_query, update_values)
            conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '프로필이 성공적으로 업데이트되었습니다.'
        }), 200
        
    except Exception as e:
        print(f"프로필 업데이트 오류: {e}")
        return jsonify({
            'success': False,
            'message': '프로필 업데이트에 실패했습니다.'
        }), 500

@user_bp.route('/api/user/password', methods=['PUT'])
@token_required
def update_password(current_user):
    """사용자 비밀번호 변경"""
    try:
        data = request.get_json()
        user_id = current_user['User_id']
        
        # 필수 필드 확인
        if 'current_password' not in data or 'new_password' not in data:
            return jsonify({
                'success': False,
                'message': '현재 비밀번호와 새 비밀번호를 입력해주세요.'
            }), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 현재 비밀번호 확인
        cursor.execute("SELECT password FROM User WHERE User_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                'success': False,
                'message': '사용자를 찾을 수 없습니다.'
            }), 404
        
        # 현재 비밀번호 검증
        hashed_current_password = hash_password(current_password)
        if user['password'] != hashed_current_password:
            return jsonify({
                'success': False,
                'message': '현재 비밀번호가 올바르지 않습니다.'
            }), 401
        
        # 새 비밀번호 해싱 및 업데이트
        hashed_new_password = hash_password(new_password)
        cursor.execute("UPDATE User SET password = %s WHERE User_id = %s", 
                      (hashed_new_password, user_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '비밀번호가 성공적으로 변경되었습니다.'
        }), 200
        
    except Exception as e:
        print(f"비밀번호 변경 오류: {e}")
        return jsonify({
            'success': False,
            'message': '비밀번호 변경에 실패했습니다.'
        }), 500

@user_bp.route('/api/user/<int:user_id>/allergies', methods=['GET'])
def get_user_allergies(user_id):
    """사용자 알레르기 정보 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT Allerg_id FROM user_allergy WHERE User_id = %s", (user_id,))
        allergies = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # 알레르기 ID들을 콤마로 구분된 문자열로 반환
        allergy_ids = [str(allergy['Allerg_id']) for allergy in allergies]
        return ','.join(allergy_ids), 200
        
    except Exception as e:
        print(f"알레르기 정보 조회 오류: {e}")
        return '', 200

@user_bp.route('/api/user/<int:user_id>/allergies', methods=['PUT'])
@token_required
def update_user_allergies(current_user, user_id):
    """사용자 알레르기 정보 업데이트"""
    try:
        data = request.get_json()
        allergies = data.get('allergies', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 기존 알레르기 정보 삭제
        cursor.execute("DELETE FROM user_allergy WHERE User_id = %s", (user_id,))
        
        # 새로운 알레르기 정보 추가
        if allergies and allergies.strip():
            allergy_ids = [int(id.strip()) for id in allergies.split(',') if id.strip().isdigit()]
            
            for allergy_id in allergy_ids:
                cursor.execute(
                    "INSERT INTO user_allergy (User_id, Allerg_id) VALUES (%s, %s)",
                    (user_id, allergy_id)
                )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '알레르기 정보가 성공적으로 업데이트되었습니다.'
        }), 200
        
    except Exception as e:
        print(f"알레르기 정보 업데이트 오류: {e}")
        return jsonify({
            'success': False,
            'message': '알레르기 정보 업데이트에 실패했습니다.'
        }), 500

@user_bp.route('/api/allergies', methods=['GET'])
def get_all_allergies():
    """전체 알레르기 목록 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM allergy")
        allergies = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'allergies': allergies
        }), 200
        
    except Exception as e:
        print(f"알레르기 목록 조회 오류: {e}")
        return jsonify({
            'success': False,
            'allergies': []
        }), 500
