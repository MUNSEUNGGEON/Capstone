import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMonthlyMeals, getMealNutritionByDate } from '../../services/mealService';
import { saveFoodDiary, getFoodDiary } from '../../services/foodDiaryService';
import { recommendedMealService } from '../../services/recommendedMealService';
import MenuBar from '../common/MenuBar';
import { Link } from 'react-router-dom';
import './FoodDiary.css';

// Chart.js 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const calculateAge = (birthStr, referenceDate = new Date()) => {
  if (!birthStr) return null;
  const birth = new Date(birthStr);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const m = referenceDate.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birth.getDate())) age--;
  return age;
};

const FoodDiary = ({ isLoggedIn, userInfo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [meals, setMeals] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [menuRatings, setMenuRatings] = useState({});
  const [comment, setComment] = useState('');
  const [diaryEntries, setDiaryEntries] = useState({});
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendedNutrition, setRecommendedNutrition] = useState({
    칼로리: 2000,
    탄수화물: 300,
    단백질: 150,
    지방: 65,
    나트륨: 2000
  });
  const [secondAge, setSecondAge] = useState('');
  const [recommendedNutrition2, setRecommendedNutrition2] = useState(null);

  // 컴포넌트 마운트 시 데이터 로드 - 단순화
  useEffect(() => {
    loadMeals();
  }, [currentDate]);

  // 식단일지 항목 로드 - 조건부 실행으로 변경
  useEffect(() => {
    if (isLoggedIn && userInfo) {
      loadDiaryEntries();
    } else {
      setDiaryEntries({});
    }
  }, [currentDate, isLoggedIn, userInfo]);

  // 사용자 나이에 맞는 권장 영양소 정보 로드
  useEffect(() => {
    if (!userInfo || !userInfo.kid_birth) return;

    const reference = selectedDate || new Date();
    const age = calculateAge(userInfo.kid_birth, reference);
    if (age === null) return;

    recommendedMealService
      .getRecommendedNutrition(age)
      .then((res) => {
        if (res.success && res.data) {
          setRecommendedNutrition({
            칼로리: res.data.calories,
            탄수화물: res.data.carbohydrate,
            단백질: res.data.protein,
            지방: res.data.fat,
            나트륨: res.data.sodium,
          });
        }
      })
      .catch(() => {});
  }, [userInfo, selectedDate]);

  // 비교용 나이에 해당하는 권장 영양소 정보 로드
  useEffect(() => {
    if (!secondAge) {
      setRecommendedNutrition2(null);
      return;
    }

    recommendedMealService
      .getRecommendedNutrition(secondAge)
      .then((res) => {
        if (res.success && res.data) {
          setRecommendedNutrition2({
            칼로리: res.data.calories,
            탄수화물: res.data.carbohydrate,
            단백질: res.data.protein,
            지방: res.data.fat,
            나트륨: res.data.sodium,
          });
        } else {
          setRecommendedNutrition2(null);
        }
      })
      .catch(() => setRecommendedNutrition2(null));
  }, [secondAge]);

  // 식단 정보 로드
  const loadMeals = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await getMonthlyMeals(year, month);
      
      if (response.success) {
        setMeals(response.meals || {});
      }
    } catch (err) {
      // 오류 처리는 유지하되 콘솔 로그 제거
    } finally {
      setLoading(false);
    }
  };

  // 식단일지 항목 로드
  const loadDiaryEntries = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // props로 받은 userInfo를 서비스 함수에 전달
      const response = await getFoodDiary(year, month, userInfo);
      
      if (response.success) {
        setDiaryEntries(response.entries || {});
      }
    } catch (err) {
      // 오류가 발생해도 빈 객체로 설정하여 페이지가 계속 작동하도록 함
      setDiaryEntries({});
    }
  };

  // 월의 모든 날짜를 가져오는 함수 (DietPlan에서 가져옴)
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 월의 첫 날
    const firstDayOfMonth = new Date(year, month, 1);
    // 현재 월의 마지막 날
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 이전 월의 마지막 날짜들을 가져오기 위해
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 1: 월요일, ...
    const daysFromPrevMonth = firstDayOfWeek;
    
    // 현재 월의 총 일 수
    const daysInMonth = lastDayOfMonth.getDate();
    
    // 다음 월의 일 수 (캘린더 채우기)
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const daysFromNextMonth = 6 - lastDayOfWeek;
    
    const totalDays = daysFromPrevMonth + daysInMonth + daysFromNextMonth;
    const totalWeeks = Math.ceil(totalDays / 7);
    
    const days = [];
    let dayCounter = 1 - daysFromPrevMonth;
    
    for (let i = 0; i < totalWeeks; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const day = new Date(year, month, dayCounter);
        week.push(day);
        dayCounter++;
      }
      days.push(week);
    }
    
    return days;
  };

  // 캘린더 이벤트 생성 (기존 함수 제거하고 새로운 핸들러들 추가)
  const handleDateClick = async (date) => {
    const dateString = formatDateString(date);
    const mealData = meals[dateString];
    setSelectedDate(date);
    setSelectedMeal(mealData);

    // 기존 일지 항목 로드
    const diaryEntry = diaryEntries[dateString];
    if (diaryEntry) {
      // 새로운 구조에서 메뉴별 평점 직접 사용
      if (diaryEntry.menu_ratings) {
        setMenuRatings(diaryEntry.menu_ratings);
      } else {
        setMenuRatings({});
      }
      setComment(diaryEntry.comment || '');
    } else {
      setMenuRatings({});
      setComment('');
    }

    // 영양소 정보 별도 요청
    if (mealData) {
      try {
        const token = userInfo?.token; // 또는 localStorage에서 토큰 추출
        const res = await getMealNutritionByDate(dateString, token);
        if (res.success) {
          setNutrition(res.nutrition);
        } else {
          setNutrition(null);
        }
      } catch {
        setNutrition(null);
      }
    } else {
      setNutrition(null);
    }
  };

  // 날짜 선택 핸들러 (기존 함수들 수정)
  const handleSelectSlot = ({ start }) => {
    handleDateClick(start);
  };

  // 이벤트 선택 핸들러
  const handleSelectEvent = (event) => {
    handleDateClick(event.start);
  };

  // 캘린더로 돌아가기
  const handleBackToCalendar = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 즉시 상태 리셋
    setSelectedDate(null);
    setSelectedMeal(null);
    setMenuRatings({});
    setComment('');
  };

  // 이전 달로 이동
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // 평점 저장
  const handleSaveDiary = async () => {
    if (!selectedDate || !selectedMeal) return;

    if (!isLoggedIn || !userInfo) {
      alert('로그인이 필요한 기능입니다. 로그인 후 이용해주세요.');
      return;
    }

    try {
      const dateString = formatDateString(selectedDate);
      
      // 메뉴별 평점의 평균을 계산하여 전체 평점으로 사용
      const ratings = Object.values(menuRatings).filter(rating => rating > 0);
      const averageRating = ratings.length > 0 ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) : 1;
      
      // 새로운 API 구조에 맞는 데이터 준비
      const diaryData = {
        date: dateString,
        rating: averageRating,
        comment: comment,
        meal_id: selectedMeal.meal_id,
        rice_rating: menuRatings.rice || null,
        soup_rating: menuRatings.soup || null,
        side_dish1_rating: menuRatings.side_dish1 || null,
        side_dish2_rating: menuRatings.side_dish2 || null,
        main_dish_rating: menuRatings.main_dish || null,
        dessert_rating: menuRatings.dessert || null
      };
      
      // props로 받은 userInfo를 서비스 함수에 전달
      const response = await saveFoodDiary(diaryData, userInfo);

      if (response.success) {
        // 로컬 상태 업데이트
        setDiaryEntries(prev => ({
          ...prev,
          [dateString]: { 
            menuRatings, 
            comment, 
            meal_id: selectedMeal.meal_id,
            rating: averageRating
          }
        }));
        alert('식단일지가 저장되었습니다.');
      } else {
        alert('저장에 실패했습니다: ' + (response.message || '알 수 없는 오류'));
      }
    } catch (err) {
      if (err.message.includes('로그인이 필요') || err.message.includes('올바르지 않은 사용자')) {
        alert('사용자 인증에 실패했습니다. 다시 로그인해주세요.\n오류: ' + err.message);
      } else {
        alert('저장에 실패했습니다: ' + err.message);
      }
    }
  };

  // 영양소 데이터 준비
  const getNutritionData = () => {
    if (!selectedMeal) return null;

    const actualNutrition = {
      칼로리:
        (nutrition && nutrition.total_calories) || selectedMeal.total_calories ||
        0,
      탄수화물:
        (nutrition && nutrition.total_carbohydrate) ||
        selectedMeal.total_carbohydrate ||
        0,
      단백질:
        (nutrition && nutrition.total_protein) || selectedMeal.total_protein || 0,
      지방: (nutrition && nutrition.total_fat) || selectedMeal.total_fat || 0,
      나트륨:
        (nutrition && nutrition.total_sodium) || selectedMeal.total_sodium || 0,
    };

    const labels = Object.keys(actualNutrition);

    const datasets = [];

    if (recommendedNutrition2) {
      datasets.push({
        label: '권장2',
        data: labels.map(key => recommendedNutrition2[key]),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
      });
    }

    if (recommendedNutrition) {
      datasets.push({
        label: '권장',
        data: labels.map(key => recommendedNutrition[key]),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      });
    }

    datasets.push({
      label: '실제',
      data: labels.map(key => actualNutrition[key]),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
    });

    return {
      labels,
      datasets,
    };
  };

  // 날짜 포맷 함수
  const formatDateString = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };

  const formatDisplayDate = (date) => {
    return moment(date).format('YYYY년 MM월 DD일');
  };

  // 새로운 포맷 함수들 추가
  const formatDate = (date) => {
    return date.getDate();
  };

  const formatMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const formatSelectedDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 두 날짜가 같은지 확인
  const isSameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // 현재 월에 속하는 날짜인지 확인
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  // 주말인지 확인
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // 특정 날짜에 식단 데이터가 있는지 확인
  const hasMealData = (date) => {
    const dateString = formatDateString(date);
    return meals[dateString] !== undefined;
  };

  // 메뉴별 별점 렌더링
  const renderMenuStars = (menuType, menuName) => {
    const rating = menuRatings[menuType] || 0;
    
    return (
      <div className="menu-rating">
        <span className="menu-name">{menuName}</span>
        <div className="stars">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`star ${index < rating ? 'filled' : ''}`}
              onClick={() => {
                setMenuRatings(prev => ({
                  ...prev,
                  [menuType]: index + 1
                }));
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    );
  };

  // 식단 정보 렌더링
  const renderMealInfo = () => {
    if (!selectedMeal) return null;

    return (
      <div className="meal-info">
        <h3>{formatDisplayDate(selectedDate)} 식단</h3>
        
        <div className="meal-ratings">
          {selectedMeal.rice_name && renderMenuStars('rice', selectedMeal.rice_name)}
          {selectedMeal.soup_name && renderMenuStars('soup', selectedMeal.soup_name)}
          {selectedMeal.main_dish_name && renderMenuStars('main_dish', selectedMeal.main_dish_name)}
          {selectedMeal.side_dish1_name && renderMenuStars('side_dish1', selectedMeal.side_dish1_name)}
          {selectedMeal.side_dish2_name && renderMenuStars('side_dish2', selectedMeal.side_dish2_name)}
          {selectedMeal.dessert_name && renderMenuStars('dessert', selectedMeal.dessert_name)}
        </div>
        
        <div className="total-nutrition">
          <p>
            <strong>
              총 칼로리:
              {nutrition && nutrition.total_calories
                ? `${nutrition.total_calories}kcal`
                : selectedMeal.total_calories
                ? `${selectedMeal.total_calories}kcal`
                : '정보 없음'}
            </strong>
          </p>
        </div>
      </div>
    );
  };

  // 새로운 캘린더 렌더링 함수
  const renderCalendar = () => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const days = getDaysInMonth();

    return (
      <div className="calendar-container">
        <div className="calendar_nav">
          <button onClick={() => prevMonth()} className="nav-btn">«</button>
          <button onClick={() => prevMonth()} className="nav-btn">‹</button>
          <span className="current-month">{formatMonth(currentDate)}</span>
          <button onClick={() => nextMonth()} className="nav-btn">›</button>
          <button onClick={() => nextMonth()} className="nav-btn">»</button>
        </div>
        
        <table className="calendar">
          <thead>
            <tr>
              {weekdays.map((day, index) => (
                <th key={index} className={index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                <tr>
                  {week.map((day, dayIndex) => {
                    const mealData = meals[formatDateString(day)];
                    return (
                      <td
                        key={dayIndex}
                        className={`calendar-cell ${!isCurrentMonth(day) ? 'other-month' : ''} ${
                          isWeekend(day) && isCurrentMonth(day) ? (day.getDay() === 0 ? 'sunday' : 'saturday') : ''
                        } ${
                          selectedDate && isSameDate(day, selectedDate) ? 'selected-date' : ''
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="calendar-date">{formatDate(day)}</div>
                        {hasMealData(day) && isCurrentMonth(day) && mealData && (
                          <div className="diet-summary">
                            {mealData.rice_name && (
                              <div className="diet-item rice">
                                {mealData.rice_name}
                              </div>
                            )}
                            {mealData.soup_name && (
                              <div className="diet-item soup">
                                {mealData.soup_name}
                              </div>
                            )}
                            {mealData.main_dish_name && (
                              <div className="diet-item main-dish">
                                {mealData.main_dish_name}
                              </div>
                            )}
                            {mealData.side_dish1_name && (
                              <div className="diet-item side-dish">
                                {mealData.side_dish1_name}
                              </div>
                            )}
                            {mealData.side_dish2_name && (
                              <div className="diet-item side-dish2">
                                {mealData.side_dish2_name}
                              </div>
                            )}
                            {mealData.dessert_name && (
                              <div className="diet-item dessert">
                                {mealData.dessert_name}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="food-diary">
      <MenuBar />
      
      <div className="diary-header">
        <h1>식단일지</h1>
        {selectedMeal && (
          <button 
            className="previous-diary-btn"
            onClick={(e) => handleBackToCalendar(e)}
          >
            이전식단 보기
          </button>
        )}
      </div>

      {!selectedMeal && (
        <div>
          <h2>식단 캘린더</h2>
          {renderCalendar()}
        </div>
      )}

      {selectedMeal && (
        <div className="diary-content">
          <div className="left-panel">
            {renderMealInfo()}
            
            <div className="rating-section">
              <h3>식단 코멘트</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="식단에 대한 의견을 남겨주세요..."
                rows={4}
                disabled={!isLoggedIn}
              />
              <button 
                onClick={handleSaveDiary} 
                className={`save-btn ${!isLoggedIn ? 'disabled' : ''}`}
                disabled={!isLoggedIn}
              >
                {isLoggedIn ? '저장' : '로그인 후 저장 가능'}
              </button>
              {!isLoggedIn && (
                <p className="login-required-message">
                  식단일지 저장은 로그인이 필요한 기능입니다.
                </p>
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="nutrition-chart">
              <h3>영양소 비교</h3>
              <div className="compare-age">
                <label>
                  비교 나이:
                  <input
                    type="number"
                    value={secondAge}
                    onChange={(e) => setSecondAge(e.target.value)}
                    placeholder="나이를 입력"
                  />
                </label>
              </div>
              {getNutritionData() && (
                <Radar
                  data={getNutritionData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 2000,
                        ticks: {
                          stepSize: 200
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedMeal && (
        <div className="no-selection">
          <p>날짜를 선택하여 식단일지를 작성해보세요.</p>
          <p>캘린더에서 식단이 있는 날짜를 클릭하면 상세보기로 이동합니다.</p>
        </div>
      )}
    </div>
  );
};

export default FoodDiary;