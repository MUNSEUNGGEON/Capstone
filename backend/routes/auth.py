from flask import Blueprint, request, jsonify
from utils.password import hash_password, generate_temp_password
from utils.email import send_email
from models.user import get_db_connection, User
from models.meal_nutrition import MealNutrition
from models.food_nutrition import FoodNutrition
from utils.auth import generate_token

import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    print(f"로그인 요청: {data.get('id')}")
    
    if not data or 'id' not in data or 'password' not in data:
        print("아이디 또는 비밀번호 누락")
        return jsonify({'success': False, 'message': '아이디와 비밀번호를 입력해주세요.'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        print(f"사용자 조회: {data['id']}")
        cursor.execute("SELECT * FROM User WHERE id = %s", (data['id'],))
        user = cursor.fetchone()
        
        if not user:
            print(f"사용자를 찾을 수 없음: {data['id']}")
            return jsonify({'success': False, 'message': '아이디 또는 비밀번호가 일치하지 않습니다.'}), 401
        
        print(f"사용자 찾음: {user['User_id']}, {user['id']}")
        
        hashed_password = hash_password(data['password'])
        if user['password'] != hashed_password:
            print("비밀번호 불일치")
            return jsonify({'success': False, 'message': '아이디 또는 비밀번호가 일치하지 않습니다.'}), 401
        
        # JWT 토큰 생성
        token = generate_token(user['User_id'])
        print(f"토큰 생성: {token[:10]}...")
        
        user_info = {
            'id': user['id'],
            'User_id': user['User_id'],
            'name': user['name'],
            'email': user['Email'],
            'phone_number': user['phone_number'],
            'postal_address': user.get('postal_address', ''),
            'address': user.get('address', ''),
            'kid_name': user.get('Kid_name', ''),
            'kid_gender': user.get('Kid_gender', ''),
            'kid_birth': user.get('Kid_birth', '')
        }
        
        print(f"로그인 성공: {user['id']}, User_id: {user['User_id']}, 토큰 포함됨: {token[:10]}...")
        
        # 응답에 token을 user 객체 내부와 별도 필드로 모두 포함
        return jsonify({
            'success': True, 
            'message': '로그인 성공', 
            'user': user_info,
            'token': token
        }), 200
    
    except Exception as e:
        print(f"로그인 오류: {str(e)}")
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/api/find-id', methods=['POST'])
def find_id():
    data = request.json
    if not data or 'name' not in data or 'phone_number' not in data or 'email' not in data:
        return jsonify({'success': False, 'message': '이름, 휴대폰번호, 이메일을 입력해주세요.'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM User WHERE name = %s AND phone_number = %s AND Email = %s", 
                      (data['name'], data['phone_number'], data['email']))
        user = cursor.fetchone()
        
        if user:
            masked_id = user['id']
            if len(masked_id) > 3:
                masked_id = masked_id[:2] + '*' * (len(masked_id) - 3) + masked_id[-1]
            else:
                masked_id = masked_id[0] + '*' * (len(masked_id) - 1)
                
            return jsonify({
                'success': True, 
                'message': '아이디를 찾았습니다.',
                'masked_id': masked_id,
                'id': user['id']
            }), 200
        else:
            return jsonify({'success': False, 'message': '일치하는 회원 정보를 찾을 수 없습니다.'}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    if not data or 'id' not in data or 'name' not in data or 'phone_number' not in data or 'email' not in data:
        return jsonify({'success': False, 'message': '아이디, 이름, 휴대폰번호, 이메일을 입력해주세요.'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT User_id, Email FROM User WHERE id = %s AND name = %s AND phone_number = %s AND Email = %s", 
                      (data['id'], data['name'], data['phone_number'], data['email']))
        user = cursor.fetchone()
        
        if user:
            temp_password = generate_temp_password()
            hashed_temp_password = hash_password(temp_password)
            
            cursor.execute("UPDATE User SET password = %s WHERE User_id = %s",
                          (hashed_temp_password, user['User_id']))
            conn.commit()
            
            email_subject = "[아동 맞춤형 식단 추천 시스템] 임시 비밀번호 발급 안내"
            email_content = f"""
            <html>
            <body>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #4a6bff;">임시 비밀번호 안내</h2>
                    <p>안녕하세요. 아동 맞춤형 식단 추천 시스템입니다.</p>
                    <p>요청하신 임시 비밀번호가 발급되었습니다.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="font-weight: bold; margin: 0;">임시 비밀번호: <span style="color: #4a6bff;">{temp_password}</span></p>
                    </div>
                    <p>보안을 위해 로그인 후 비밀번호를 변경해주세요.</p>
                    <p>감사합니다.</p>
                </div>
            </body>
            </html>
            """
            
            email_sent = send_email(user['Email'], email_subject, email_content)
            
            if email_sent:
                return jsonify({
                    'success': True, 
                    'message': '임시 비밀번호가 이메일로 전송되었습니다.',
                    'email': user['Email']
                }), 200
            else:
                return jsonify({
                    'success': True, 
                    'message': '이메일 전송에 실패했으나 임시 비밀번호가 생성되었습니다.',
                    'temp_password': temp_password
                }), 200
        else:
            return jsonify({'success': False, 'message': '일치하는 회원 정보를 찾을 수 없습니다.'}), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'message': f'오류가 발생했습니다: {str(e)}'}), 500
    
    finally:
        cursor.close()
        conn.close()