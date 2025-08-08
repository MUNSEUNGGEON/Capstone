from flask import Blueprint, request, jsonify, current_app
import pymysql
from datetime import datetime, timedelta
import calendar

food_diary_bp = Blueprint('food_diary', __name__, url_prefix='/api')

def get_db_connection():
    return pymysql.connect(
        host=current_app.config['DB_HOST'],
        user=current_app.config['DB_USER'],
        password=current_app.config['DB_PASSWORD'],
        database=current_app.config['DB_NAME'],
        charset='utf8mb4'
    )

@food_diary_bp.route('/food-diary', methods=['POST'])
def save_food_diary():
    """식단일지 저장"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        date = data.get('date')
        rating = data.get('rating')  # 전체 평점 (메뉴별 평점의 평균)
        comment = data.get('comment', '')
        meal_id = data.get('meal_id')
        
        # 메뉴별 평점
        rice_rating = data.get('rice_rating')
        soup_rating = data.get('soup_rating')
        side_dish1_rating = data.get('side_dish1_rating')
        side_dish2_rating = data.get('side_dish2_rating')
        main_dish_rating = data.get('main_dish_rating')
        dessert_rating = data.get('dessert_rating')
        
        if not all([user_id, date]):
            return jsonify({
                'success': False,
                'message': '필수 정보가 누락되었습니다.'
            }), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # 기존 일지가 있는지 확인
        check_query = """
            SELECT diary_id FROM food_diary 
            WHERE user_id = %s AND date = %s
        """
        cursor.execute(check_query, (user_id, date))
        existing_diary = cursor.fetchone()
        
        if existing_diary:
            # 업데이트
            update_query = """
                UPDATE food_diary 
                SET rating = %s, comment = %s, meal_id = %s, 
                    rice_rating = %s, soup_rating = %s, side_dish1_rating = %s,
                    side_dish2_rating = %s, main_dish_rating = %s, dessert_rating = %s,
                    updated_at = NOW()
                WHERE user_id = %s AND date = %s
            """
            cursor.execute(update_query, (
                rating, comment, meal_id,
                rice_rating, soup_rating, side_dish1_rating,
                side_dish2_rating, main_dish_rating, dessert_rating,
                user_id, date
            ))
            diary_id = existing_diary[0]
        else:
            # 새로 생성
            insert_query = """
                INSERT INTO food_diary (
                    user_id, date, rating, comment, meal_id,
                    rice_rating, soup_rating, side_dish1_rating,
                    side_dish2_rating, main_dish_rating, dessert_rating,
                    created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            cursor.execute(insert_query, (
                user_id, date, rating, comment, meal_id,
                rice_rating, soup_rating, side_dish1_rating,
                side_dish2_rating, main_dish_rating, dessert_rating
            ))
            diary_id = cursor.lastrowid
        
        connection.commit()
        
        return jsonify({
            'success': True,
            'message': '식단일지가 저장되었습니다.',
            'diary_id': diary_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'식단일지 저장 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@food_diary_bp.route('/food-diary/<int:user_id>', methods=['GET'])
def get_food_diary(user_id):
    """월별 식단일지 조회"""
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        if not year or not month:
            return jsonify({
                'success': False,
                'message': '년도와 월을 지정해주세요.'
            }), 400
        
        connection = get_db_connection()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # 해당 월의 식단일지 조회 (메뉴별 평점 포함)
        query = """
            SELECT diary_id, date, rating, comment, meal_id, 
                   rice_rating, soup_rating, side_dish1_rating,
                   side_dish2_rating, main_dish_rating, dessert_rating,
                   created_at, updated_at
            FROM food_diary 
            WHERE user_id = %s 
            AND YEAR(date) = %s 
            AND MONTH(date) = %s
            ORDER BY date
        """
        cursor.execute(query, (user_id, year, month))
        diary_entries = cursor.fetchall()
        
        # 날짜를 키로 하는 딕셔너리로 변환
        entries = {}
        for entry in diary_entries:
            date_str = entry['date'].strftime('%Y-%m-%d')
            entries[date_str] = {
                'diary_id': entry['diary_id'],
                'rating': entry['rating'],
                'comment': entry['comment'],
                'meal_id': entry['meal_id'],
                'menu_ratings': {
                    'rice': entry['rice_rating'],
                    'soup': entry['soup_rating'],
                    'main_dish': entry['main_dish_rating'],
                    'side_dish1': entry['side_dish1_rating'],
                    'side_dish2': entry['side_dish2_rating'],
                    'dessert': entry['dessert_rating']
                },
                'created_at': entry['created_at'].isoformat() if entry['created_at'] else None,
                'updated_at': entry['updated_at'].isoformat() if entry['updated_at'] else None
            }
        
        return jsonify({
            'success': True,
            'entries': entries
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'식단일지 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@food_diary_bp.route('/food-diary/<int:user_id>/<date>', methods=['GET'])
def get_food_diary_by_date(user_id, date):
    """특정 날짜의 식단일지 조회"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        query = """
            SELECT diary_id, date, rating, comment, meal_id,
                   rice_rating, soup_rating, side_dish1_rating,
                   side_dish2_rating, main_dish_rating, dessert_rating,
                   created_at, updated_at
            FROM food_diary 
            WHERE user_id = %s AND date = %s
        """
        cursor.execute(query, (user_id, date))
        diary_entry = cursor.fetchone()
        
        if diary_entry:
            entry = {
                'diary_id': diary_entry['diary_id'],
                'date': diary_entry['date'].strftime('%Y-%m-%d'),
                'rating': diary_entry['rating'],
                'comment': diary_entry['comment'],
                'meal_id': diary_entry['meal_id'],
                'menu_ratings': {
                    'rice': diary_entry['rice_rating'],
                    'soup': diary_entry['soup_rating'],
                    'main_dish': diary_entry['main_dish_rating'],
                    'side_dish1': diary_entry['side_dish1_rating'],
                    'side_dish2': diary_entry['side_dish2_rating'],
                    'dessert': diary_entry['dessert_rating']
                },
                'created_at': diary_entry['created_at'].isoformat() if diary_entry['created_at'] else None,
                'updated_at': diary_entry['updated_at'].isoformat() if diary_entry['updated_at'] else None
            }
            
            return jsonify({
                'success': True,
                'entry': entry
            })
        else:
            return jsonify({
                'success': True,
                'entry': None,
                'message': '해당 날짜의 식단일지가 없습니다.'
            })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'식단일지 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@food_diary_bp.route('/food-diary/<int:diary_id>', methods=['PUT'])
def update_food_diary(diary_id):
    """식단일지 업데이트"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        # 메뉴별 평점
        rice_rating = data.get('rice_rating')
        soup_rating = data.get('soup_rating')
        side_dish1_rating = data.get('side_dish1_rating')
        side_dish2_rating = data.get('side_dish2_rating')
        main_dish_rating = data.get('main_dish_rating')
        dessert_rating = data.get('dessert_rating')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': '사용자 ID가 필요합니다.'
            }), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # 해당 일지가 사용자의 것인지 확인
        check_query = """
            SELECT diary_id FROM food_diary 
            WHERE diary_id = %s AND user_id = %s
        """
        cursor.execute(check_query, (diary_id, user_id))
        if not cursor.fetchone():
            return jsonify({
                'success': False,
                'message': '권한이 없습니다.'
            }), 403
        
        # 업데이트
        update_query = """
            UPDATE food_diary 
            SET rating = %s, comment = %s,
                rice_rating = %s, soup_rating = %s, side_dish1_rating = %s,
                side_dish2_rating = %s, main_dish_rating = %s, dessert_rating = %s,
                updated_at = NOW()
            WHERE diary_id = %s
        """
        cursor.execute(update_query, (
            rating, comment,
            rice_rating, soup_rating, side_dish1_rating,
            side_dish2_rating, main_dish_rating, dessert_rating,
            diary_id
        ))
        connection.commit()
        
        return jsonify({
            'success': True,
            'message': '식단일지가 업데이트되었습니다.'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'식단일지 업데이트 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@food_diary_bp.route('/food-diary/<int:diary_id>', methods=['DELETE'])
def delete_food_diary(diary_id):
    """식단일지 삭제"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': '사용자 ID가 필요합니다.'
            }), 400
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # 해당 일지가 사용자의 것인지 확인
        check_query = """
            SELECT diary_id FROM food_diary 
            WHERE diary_id = %s AND user_id = %s
        """
        cursor.execute(check_query, (diary_id, user_id))
        if not cursor.fetchone():
            return jsonify({
                'success': False,
                'message': '권한이 없습니다.'
            }), 403
        
        # 삭제
        delete_query = "DELETE FROM food_diary WHERE diary_id = %s"
        cursor.execute(delete_query, (diary_id,))
        connection.commit()
        
        return jsonify({
            'success': True,
            'message': '식단일지가 삭제되었습니다.'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'식단일지 삭제 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()

@food_diary_bp.route('/food-diary/stats/<int:user_id>', methods=['GET'])
def get_diary_stats(user_id):
    """식단일지 통계 조회"""
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        if not year or not month:
            return jsonify({
                'success': False,
                'message': '년도와 월을 지정해주세요.'
            }), 400
        
        connection = get_db_connection()
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # 평균 평점 및 총 일지 수 조회
        stats_query = """
            SELECT 
                COUNT(*) as total_entries,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating >= 4 THEN 1 END) as high_rating_count
            FROM food_diary 
            WHERE user_id = %s 
            AND YEAR(date) = %s 
            AND MONTH(date) = %s
        """
        cursor.execute(stats_query, (user_id, year, month))
        stats = cursor.fetchone()
        
        # 일별 평점 분포
        rating_distribution = {}
        rating_query = """
            SELECT rating, COUNT(*) as count
            FROM food_diary 
            WHERE user_id = %s 
            AND YEAR(date) = %s 
            AND MONTH(date) = %s
            GROUP BY rating
            ORDER BY rating
        """
        cursor.execute(rating_query, (user_id, year, month))
        ratings = cursor.fetchall()
        
        for rating_data in ratings:
            rating_distribution[str(rating_data['rating'])] = rating_data['count']
        
        return jsonify({
            'success': True,
            'stats': {
                'total_entries': stats['total_entries'] if stats else 0,
                'average_rating': float(stats['average_rating']) if stats and stats['average_rating'] else 0,
                'high_rating_count': stats['high_rating_count'] if stats else 0,
                'rating_distribution': rating_distribution
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'통계 조회 중 오류가 발생했습니다: {str(e)}'
        }), 500
    finally:
        if 'connection' in locals():
            connection.close()