from flask import Blueprint, request, jsonify
from models.user import get_db_connection
from datetime import date
from dateutil.relativedelta import relativedelta

growth_bp = Blueprint('growth', __name__)

# 캘린더에서 기간 선택 후 키, 몸무게 출력 + 또래와 비교
@growth_bp.route('/api/get_growth_peer_data', methods=['GET'])
def get_growth_peer_data():
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date', '2000-01-01')
    end_date = request.args.get('end_date', '2100-01-01')

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 사용자 성장 데이터 조회
            cursor.execute("""
                SELECT record_date, height_cm, weight_kg
                FROM child_growth
                WHERE child_id = %s AND record_date BETWEEN %s AND %s
                ORDER BY record_date
            """, (user_id, start_date, end_date))
            growth_records = cursor.fetchall()

            growth_data = []
            peer_data = []

            for record in growth_records:
                record_date = record['record_date']
                height = record['height_cm']
                weight = record['weight_kg']

                growth_data.append({
                    'record_date': record_date.strftime('%Y-%m-%d'),
                    'height_cm': height,
                    'weight_kg': weight
                })

                # 간단한 또래 평균 계산 (같은 날짜의 모든 아이들 평균)
                cursor.execute("""
                    SELECT AVG(height_cm) as avg_height, AVG(weight_kg) as avg_weight
                    FROM child_growth
                    WHERE record_date = %s AND child_id != %s
                """, (record_date, user_id))
                
                peer_avg = cursor.fetchone()
                if peer_avg and peer_avg['avg_height'] and peer_avg['avg_weight']:
                    peer_data.append({
                        'date': record_date.strftime('%Y-%m-%d'),
                        'avg_height': round(peer_avg['avg_height'], 1),
                        'avg_weight': round(peer_avg['avg_weight'], 1)
                    })
                else:
                    # 또래 데이터가 없으면 기본값 제공
                    peer_data.append({
                        'date': record_date.strftime('%Y-%m-%d'),
                        'avg_height': height + 5,  # 임시 데이터
                        'avg_weight': weight + 2   # 임시 데이터
                    })

            return jsonify({
                'growth_data': growth_data,
                'peer_data': peer_data
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

# 키, 몸무게 기록 API
@growth_bp.route('/api/height_weight', methods=['GET', 'POST'])
def height_weight():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT record_date, height_cm, weight_kg
                    FROM child_growth
                    WHERE child_id = %s
                    ORDER BY record_date DESC
                """, (user_id,))
                records = cursor.fetchall()

                growth_data = []
                for record in records:
                    growth_data.append({
                        'record_date': record['record_date'].strftime('%Y-%m-%d'),
                        'height_cm': record['height_cm'],
                        'weight_kg': record['weight_kg']
                    })

                return jsonify({'growth_data': growth_data})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            connection.close()

    elif request.method == 'POST':
        data = request.json
        child_id = data.get('child_id')
        height = data.get('height')
        weight = data.get('weight')
        record_date = data.get('record_date', date.today().strftime('%Y-%m-%d'))

        if not all([child_id, height, weight]):
            return jsonify({'error': 'child_id, height, weight are required'}), 400

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # 같은 날짜에 기록이 있는지 확인
                cursor.execute("""
                    SELECT * FROM child_growth 
                    WHERE child_id = %s AND record_date = %s
                """, (child_id, record_date))
                
                existing_record = cursor.fetchone()
                
                if existing_record:
                    # 기존 기록 업데이트
                    cursor.execute("""
                        UPDATE child_growth 
                        SET height_cm = %s, weight_kg = %s 
                        WHERE child_id = %s AND record_date = %s
                    """, (height, weight, child_id, record_date))
                else:
                    # 새 기록 삽입
                    cursor.execute("""
                        INSERT INTO child_growth (child_id, height_cm, weight_kg, record_date)
                        VALUES (%s, %s, %s, %s)
                    """, (child_id, height, weight, record_date))

                connection.commit()
                return jsonify({'message': 'Growth data saved successfully'}), 200

        except Exception as e:
            connection.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            connection.close()

# 최근 30일 키 성장 상위 랭킹 조회
@growth_bp.route('/api/top_growth_children')
def top_growth_children():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                WITH recent_growth AS (
                    SELECT 
                        child_id,
                        height_cm,
                        record_date,
                        LAG(height_cm) OVER (PARTITION BY child_id ORDER BY record_date) as prev_height,
                        LAG(record_date) OVER (PARTITION BY child_id ORDER BY record_date) as prev_date
                    FROM child_growth
                    WHERE record_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ),
                growth_diff AS (
                    SELECT 
                        child_id,
                        (height_cm - prev_height) as height_growth,
                        DATEDIFF(record_date, prev_date) as days_diff
                    FROM recent_growth
                    WHERE prev_height IS NOT NULL
                    AND DATEDIFF(record_date, prev_date) <= 30
                )
                SELECT 
                    child_id,
                    ROUND(SUM(height_growth), 1) as height_growth
                FROM growth_diff
                WHERE height_growth > 0
                GROUP BY child_id
                ORDER BY height_growth DESC
                LIMIT 10
            """)
            
            top_children = cursor.fetchall()
            return jsonify(top_children)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close() 