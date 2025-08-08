import datetime
from services.meal_generate_daily import generate_daily_meal

def generate_weekly_meal(user_id, start_date=None):
    """
    7일치(일주일) 식단을 생성합니다.
    """
    if start_date is None:
        start_date = datetime.date.today()

    print(f"🌟 7일치 식단 생성 시작: user_id={user_id}, start_date={start_date}")
    meals_created = 0
    current_date = start_date

    for i in range(7):
        meal_id = generate_daily_meal(user_id, current_date)
        if meal_id:
            meals_created += 1
            print(f"  ✅ {i+1}일차 식단 생성 완료!")
        else:
            print(f"  ❌ {i+1}일차 식단 생성 실패")
        current_date += datetime.timedelta(days=1)

    print(f"🎉 7일치 식단 생성 완료: {meals_created}일치 생성됨")
    return meals_created
