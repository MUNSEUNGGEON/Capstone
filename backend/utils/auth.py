from functools import wraps
from flask import request, jsonify
import jwt
import datetime
import traceback
from config import get_jwt_secret_key
from models.user import User

def generate_token(user_id):
    """JWT 토큰을 생성합니다."""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),  # 토큰 만료 시간 (1일)
        'iat': datetime.datetime.utcnow(),  # 토큰 발급 시간
        'sub': str(user_id)  # 사용자 ID
    }
    token = jwt.encode(payload, get_jwt_secret_key(), algorithm='HS256')
    # PyJWT 2.x 이상에서는 bytes로 반환될 수 있으므로 str로 변환
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def token_required(f):
    """JWT 토큰 검증 데코레이터"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        print(f"요청 헤더: {request.headers}")
        
        # Authorization 헤더에서 토큰 가져오기
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print(f"인증 헤더: {auth_header}")
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # 'Bearer ' 제거
                print(f"추출된 토큰: {token[:10]}...")
        else:
            print("Authorization 헤더가 없습니다.")
        
        if not token:
            print("토큰이 제공되지 않았습니다.")
            return jsonify({
                'success': False,
                'message': '토큰이 필요합니다.'
            }), 401
        
        try:
            # 토큰 디코딩
            print(f"JWT 시크릿 키: {get_jwt_secret_key()[:5]}...")
            payload = jwt.decode(token, get_jwt_secret_key(), algorithms=['HS256'])
            user_id = payload['sub']
            print(f"토큰에서 추출한 사용자 ID: {user_id}")
            
            # 사용자 정보 가져오기
            current_user = User.get_by_id(user_id)
            
            if not current_user:
                print(f"ID {user_id}에 해당하는 사용자를 찾을 수 없습니다.")
                return jsonify({
                    'success': False,
                    'message': '유효하지 않은 사용자입니다.'
                }), 401
            
            print(f"사용자 인증 성공: {current_user['id']}")
                
        except jwt.ExpiredSignatureError:
            print("토큰이 만료되었습니다.")
            return jsonify({
                'success': False,
                'message': '토큰이 만료되었습니다. 다시 로그인해주세요.'
            }), 401
        except jwt.InvalidTokenError as e:
            print(f"유효하지 않은 토큰: {str(e)}")
            return jsonify({
                'success': False,
                'message': '유효하지 않은 토큰입니다.'
            }), 401
        except Exception as e:
            print(f"토큰 검증 중 예외 발생: {str(e)}")
            traceback.print_exc()
            return jsonify({
                'success': False,
                'message': f'인증 처리 중 오류가 발생했습니다: {str(e)}'
            }), 500
        
        # 원래 함수 호출 시 현재 사용자 정보 전달
        return f(current_user, *args, **kwargs)
    
    return decorated