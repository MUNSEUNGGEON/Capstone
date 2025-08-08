from flask import Blueprint, jsonify
from utils.auth import token_required
from models.meal import Meal
from models.meal_nutrition import get_meal_nutrition

meal_nutrition_bp = Blueprint('meal_nutrition', __name__)

@meal_nutrition_bp.route('/api/meal-nutrition/<string:date_str>', methods=['GET'])
@token_required
def get_meal_nutrition_by_date(current_user, date_str):
    """
    특정 날짜의 식단 영양소 총합 정보를 반환합니다.
    """
    user_id = current_user['User_id']
    meal = Meal.get_by_user_and_date(user_id, date_str)
    if not meal or not meal.get('Meal_id'):
        return jsonify({'success': False, 'message': '식단 정보가 없습니다.'}), 404

    nutrition = get_meal_nutrition(meal['Meal_id'])
    if nutrition:
        return jsonify({'success': True, 'nutrition': nutrition})
    else:
        return jsonify({'success': False, 'message': '식단 영양소 정보가 없습니다.'}), 404