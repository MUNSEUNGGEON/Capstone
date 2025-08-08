from flask import Blueprint, jsonify
from utils.auth import token_required
from models.food_nutrition import get_nutrition_by_food_id

food_nutrition_bp = Blueprint('food_nutrition', __name__)

@food_nutrition_bp.route('/api/food-nutrition/<food_id>', methods=['GET'])
@token_required
def get_food_nutrition(current_user, food_id):
    """
    특정 음식의 영양소 정보를 반환합니다.
    """
    nutrition = get_nutrition_by_food_id(food_id)
    if nutrition:
        return jsonify({'success': True, 'nutrition': nutrition})
    else:
        return jsonify({'success': False, 'message': '영양소 정보가 없습니다.'}), 404