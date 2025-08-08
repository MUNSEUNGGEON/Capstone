import hashlib
import random
import string

def hash_password(password):
    """비밀번호를 SHA-256으로 해싱"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_temp_password():
    """임시 비밀번호 생성"""
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(chars) for _ in range(10)) 