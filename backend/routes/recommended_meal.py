from flask import Blueprint, jsonify
from models.recommended_meal import RecommendedMeal

recommended_meal_bp = Blueprint('recommended_meal', __name__)

@recommended_meal_bp.route('/api/recommended-meal/<int:age>', methods=['GET'])
def get_recommended_meal(age):
    """사용자 나이에 맞는 권장 영양소 정보를 반환."""
    data = RecommendedMeal.get_by_age(age)
    if data:
        return jsonify({'success': True, 'data': data})
    return jsonify({'success': False, 'message': '권장 영양소 정보가 없습니다.'}), 404
