from flask import Blueprint, request, jsonify
import datetime
import traceback
import calendar
from models.meal import Meal
from services.meal_generate_daily import generate_daily_meal
from services.meal_generate_weekly import generate_weekly_meal
from services.meal_generate_monthly import generate_monthly_meal as generate_monthly_meal_plan
from utils.auth import token_required
from flask_cors import cross_origin

meal_bp = Blueprint('meal', __name__)

# 1️⃣ 하루 식단 생성
@meal_bp.route('/api/meals/generate/daily', methods=['POST', 'OPTIONS'])
@cross_origin()
@token_required
def generate_daily_meal_route(current_user):
    try:
        user_id = current_user['User_id']
        data = request.get_json() or {}
        date_str = data.get('date')
        
        if date_str:
            try:
                date = datetime.datetime.fromisoformat(date_str).date()
            except ValueError:
                date = datetime.date.today()
        else:
            date = datetime.date.today()
        
        meal_id = generate_daily_meal(user_id, date)
        
        if meal_id:
            return jsonify({
                'success': True,
                'message': '하루 식단이 생성되었습니다.',
                'meal_id': meal_id
            })
        else:
            return jsonify({
                'success': False,
                'message': '식단 생성에 실패했습니다.'
            }), 500
    except Exception as e:
        print(f"❌ 하루 식단 생성 오류: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'식단 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 2️⃣ 일주일 식단 생성
@meal_bp.route('/api/meals/generate/weekly', methods=['POST', 'OPTIONS'])
@cross_origin()
@token_required
def generate_weekly_meal_route(current_user):
    try:
        user_id = current_user['User_id']
        data = request.get_json() or {}
        start_date_str = data.get('start_date')
        
        if start_date_str:
            try:
                start_date = datetime.datetime.fromisoformat(start_date_str).date()
            except ValueError:
                start_date = datetime.date.today()
        else:
            start_date = datetime.date.today()
        
        meals_created = generate_weekly_meal(user_id, start_date)
        
        return jsonify({
            'success': True,
            'message': f'{meals_created}일치 식단이 생성되었습니다.',
            'meals_created': meals_created
        })
    except Exception as e:
        print(f"❌ 일주일치 식단 생성 오류: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'식단 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 3️⃣ 한 달 식단 생성
@meal_bp.route('/api/meals/generate/monthly', methods=['POST', 'OPTIONS'])
@cross_origin()
@token_required
def generate_monthly_meal_route(current_user):
    try:
        user_id = current_user['User_id']
        data = request.get_json() or {}
        start_date_str = data.get('start_date')
        
        if start_date_str:
            try:
                start_date = datetime.datetime.fromisoformat(start_date_str).date()
            except ValueError:
                start_date = datetime.date.today()
        else:
            start_date = datetime.date.today()
        
        meals_created = generate_monthly_meal_plan(user_id, start_date)
        
        return jsonify({
            'success': True,
            'message': f'{meals_created}일치 식단이 생성되었습니다.',
            'meals_created': meals_created
        })
    except Exception as e:
        print(f"❌ 한 달치 식단 생성 오류: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'식단 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 4️⃣ 특정 날짜의 식단 조회
@meal_bp.route('/api/meals/<string:date_str>', methods=['GET'])
@token_required
def get_meal_by_date(current_user, date_str):
    try:
        user_id = current_user['User_id']
        print(f"날짜별 식단 조회 user_id={user_id}, 날짜={date_str}")
        date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        
        meal = Meal.get_by_user_and_date(user_id, date)
        if meal:
            return jsonify({
                'success': True,
                'meal': meal
            })
        else:
            return jsonify({
                'success': False,
                'message': '해당 날짜에 식단 정보가 없습니다.'
            }), 404
    except Exception as e:
        print(f"❌ 날짜별 식단 조회 오류: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'식단 정보를 가져오는 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 5️⃣ 특정 날짜의 식단 재생성
@meal_bp.route('/api/meals/regenerate/<string:date_str>', methods=['POST'])
@token_required
def regenerate_meal(current_user, date_str):
    try:
        user_id = current_user['User_id']
        print(f"식단 재생성 user_id={user_id}, 날짜={date_str}")
        date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        
        Meal.delete_by_user_and_date(user_id, date)
        meal_id = generate_daily_meal(user_id, date)
        
        if meal_id:
            meal = Meal.get_by_user_and_date(user_id, date)
            return jsonify({
                'success': True,
                'message': '식단이 다시 생성되었습니다.',
                'meal': meal
            })
        else:
            return jsonify({
                'success': False,
                'message': '식단 생성에 실패했습니다.'
            }), 500
    except Exception as e:
        print(f"❌ 식단 재생성 오류: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'식단 다시 생성 중 오류가 발생했습니다: {str(e)}'
        }), 500

# 6️⃣ 월별 식단 조회
@meal_bp.route('/api/meals/monthly', methods=['GET'])
@token_required
def get_monthly_meals(current_user):
    try:
        user_id = current_user['User_id']
        year = int(request.args.get('year'))
        month = int(request.args.get('month'))
        meals = Meal.get_monthly_meals(user_id, year, month)
        return jsonify({'success': True, 'meals': meals})
    except Exception as e:
        print(f"❌ 월별 식단 조회 오류: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
