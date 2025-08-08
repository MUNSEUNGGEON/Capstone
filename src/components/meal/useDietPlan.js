import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonthlyMeals, generateMonthlyMeals, regenerateMeal } from '../../services/mealService';
import axios from 'axios';

export default function useDietPlan() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState('월');
  const [meals, setMeals] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [showGenerateOptions, setShowGenerateOptions] = useState(false);

  useEffect(() => {
    loadMeals();
    // eslint-disable-next-line
  }, [currentDate]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError('');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await getMonthlyMeals(year, month);
      if (response.success) {
        setMeals(response.meals || {});
      } else {
        setError('식단 정보를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 데이터를 가져오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMeals = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await generateMonthlyMeals();
      if (response.success) {
        loadMeals();
      } else {
        setError(response.message || '식단 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 식단 생성에 실패했습니다.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateMeal = async (date) => {
    try {
      setLoading(true);
      const dateString = formatDateString(date);
      const response = await regenerateMeal(dateString);
      if (response.success) {
        loadMeals();
        if (response.meal) {
          setSelectedMeal(response.meal);
        }
      } else {
        setError(response.message || '식단 재생성에 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 식단 재생성에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysFromPrevMonth = firstDayOfWeek;
    const daysInMonth = lastDayOfMonth.getDate();
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

  // 기존 getDaysInMonth 함수는 월 단위만 지원하므로, 일/주/월별로 days 배열을 다르게 생성
  const getDays = () => {
    if (viewType === '월') {
      return getDaysInMonth();
    } else if (viewType === '주') {
      // 주간: 현재 달력에서 선택된 날짜가 포함된 주를, currentDate 기준으로 생성
      const baseDate = expandedDate || selectedDate || currentDate;
      const week = [];
      const startOfWeek = new Date(baseDate);
      // 한국 기준: 주의 시작을 월요일로 맞춤
      const dayOfWeek = startOfWeek.getDay();
      // 일요일(0)이면 -6, 월요일(1)이면 0, 화요일(2)이면 -1, ...
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(baseDate.getDate() + diff);
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        week.push(day);
      }
      return [week];
    } else if (viewType === '일') {
      // 일간: currentDate 또는 expandedDate/selectedDate 기준
      const baseDate = expandedDate || selectedDate || currentDate;
      return [[new Date(baseDate)]];
    }
    return getDaysInMonth();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateString = formatDateString(date);
    const mealData = meals[dateString] || null;
    setSelectedMeal(mealData);
    if (expandedDate && isSameDate(expandedDate, date)) {
      setExpandedDate(null);
      setSelectedMenuItem(null);
    } else {
      if (mealData) {
        setExpandedDate(date);
        setSelectedMenuItem(null);
      } else {
        setExpandedDate(null);
        setSelectedMenuItem(null);
      }
    }
    setShowFoodDetail(false);
    setSelectedFoodId(null);
  };

  const handleMenuItemClick = (e, itemType) => {
    e.stopPropagation();
    setSelectedMenuItem(itemType === selectedMenuItem ? null : itemType);
  };

  const handleFoodClick = (foodId) => {
    if (foodId) {
      setSelectedFoodId(foodId);
      setShowFoodDetail(true);
    }
  };

  const handleCloseFoodDetail = () => {
    setShowFoodDetail(false);
    setSelectedFoodId(null);
  };

  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setExpandedDate(null);
    setSelectedMenuItem(null);
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setExpandedDate(null);
    setSelectedMenuItem(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setExpandedDate(null);
    setSelectedMenuItem(null);
  };

  const formatDate = (date) => date.getDate();
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formatMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };
  const formatSelectedDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  const isSameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();
  };
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };
  const hasMealData = (date) => {
    const dateString = formatDateString(date);
    return meals[dateString] !== undefined;
  };

  // 식단 생성 옵션 토글
  const handleShowGenerateOptions = () => {
    setShowGenerateOptions((prev) => !prev);
  };

  // 식단 생성 타입별 맵핑
  const handleGenerateByType = async (type) => {
    setGenerating(true);
    setError('');
    try {
      let response;
      // userInfo에서 token 추출
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token;
      if (type === '하루') {
        response = await axios.post('/api/meals/generate/daily', { date: new Date().toISOString().slice(0, 10) }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (type === '일주일') {
        response = await axios.post('/api/meals/generate/weekly', { start_date: new Date().toISOString().slice(0, 10) }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (type === '한달') {
        response = await axios.post('/api/meals/generate/monthly', { start_date: new Date().toISOString().slice(0, 10) }, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (response && response.data && response.data.success) {
        loadMeals();
        setShowGenerateOptions(false);
      } else {
        setError(response?.data?.message || '식단 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 식단 생성에 실패했습니다.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const days = getDays();

  return {
    navigate,
    currentDate, setCurrentDate, selectedDate, setSelectedDate, viewType, setViewType,
    meals, setMeals, selectedMeal, setSelectedMeal, loading, setLoading, error, setError,
    generating, setGenerating, expandedDate, setExpandedDate, selectedMenuItem, setSelectedMenuItem,
    selectedFoodId, setSelectedFoodId, showFoodDetail, setShowFoodDetail,
    loadMeals, handleGenerateMeals, handleRegenerateMeal, getDaysInMonth, handleDateClick,
    handleMenuItemClick, handleFoodClick, handleCloseFoodDetail, prevMonth, nextMonth, goToToday,
    formatDate, formatDateString, formatMonth, formatSelectedDate, isSameDate, isCurrentMonth, isWeekend,
    handleViewTypeChange, hasMealData, weekdays, days,
    showGenerateOptions, setShowGenerateOptions,
    handleShowGenerateOptions, handleGenerateByType,
  };
}
