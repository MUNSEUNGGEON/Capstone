from flask import Blueprint, request, jsonify
from utils.password import hash_password
from models.user import get_db_connection
from utils.auth import generate_token

register_bp = Blueprint('register', __name__)

@register_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    required_fields = [
        'id', 'password', 'name', 'email', 
        'phone_number', 'postal_address', 'address', 
        'kid_name', 'kid_gender', 'kid_birth'
    ]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'success': False, 'message': f'{field} 항목은 필수입니다.'}), 400
    hashed_password = hash_password(data['password'])
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # 아이디 중복 검사
        cursor.execute("SELECT * FROM User WHERE id = %s", (data['id'],))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': '이미 존재하는 아이디입니다.'}), 400
        # 사용자 정보 저장
        query = """
        INSERT INTO User (id, password, name, phone_number, Email, address, postal_address, Kid_name, Kid_gender, Kid_birth)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['id'],
            hashed_password,
            data['name'],
            data.get('phone_number', None),
            data.get('email', None),
            data.get('address', None),
            data.get('postal_address', None),
            data.get('kid_name', None),
            data.get('kid_gender', None),
            data.get('kid_birth', None)
        ))
        user_id = cursor.lastrowid
        # 알레르기 정보가 있으면 삽입
        if 'allergies' in data and data['allergies']:
            for allerg_id in data['allergies']:
                allerg_query = """
                INSERT INTO User_Allergy (User_id, Allerg_id)
                VALUES (%s, %s)
                """
                cursor.execute(allerg_query, (user_id, allerg_id))
        conn.commit()
        
        # 생성된 사용자 정보를 다시 조회하여 완전한 정보 반환
        cursor.execute("SELECT * FROM User WHERE User_id = %s", (user_id,))
        created_user = cursor.fetchone()
        
        # 회원가입 성공 시 완전한 user 정보와 JWT 토큰 반환
        user_info = {
            'id': created_user['id'],
            'User_id': created_user['User_id'],
            'name': created_user['name'],
            'email': created_user['Email'],
            'phone_number': created_user['phone_number'],
            'postal_address': created_user.get('postal_address', ''),
            'address': created_user.get('address', ''),
            'kid_name': created_user.get('Kid_name', ''),
            'kid_gender': created_user.get('Kid_gender', ''),
            'kid_birth': created_user.get('Kid_birth', '')
        }
        token = generate_token(user_id)
        return jsonify({'success': True, 'message': '회원가입이 완료되었습니다.', 'user': user_info, 'token': token}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()

@register_bp.route('/api/check-id', methods=['POST'])
def check_id():
    data = request.json
    if not data or 'id' not in data:
        return jsonify({'success': False, 'message': '아이디를 입력해주세요.'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM User WHERE id = %s", (data['id'],))
        user = cursor.fetchone()
        
        if user:
            return jsonify({'success': False, 'message': '이미 존재하는 아이디입니다.'}), 200
        else:
            return jsonify({'success': True, 'message': '사용 가능한 아이디입니다.'}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

@register_bp.route('/api/allergies', methods=['GET'])
def get_allergies():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM Allergy ORDER BY Allerg_id")
        allergies = cursor.fetchall()
        
        return jsonify({'success': True, 'allergies': allergies}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()