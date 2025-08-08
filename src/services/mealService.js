import axios from 'axios';
import { API_URL } from './apiConfig';

// JWT 토큰을 헤더에 포함시키는 함수
const getAuthHeader = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      console.error('localStorage에 userInfo가 없습니다.');
      return { headers: { 'Authorization': 'Bearer ' } };
    }
    
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo.token) {
      console.error('userInfo에 token이 없습니다:', userInfo);
      return { headers: { 'Authorization': 'Bearer ' } };
    }
    
    return {
      headers: {
        'Authorization': `Bearer ${userInfo.token}`
      }
    };
  } catch (error) {
    console.error('인증 헤더 생성 중 오류:', error);
    return { headers: { 'Authorization': 'Bearer ' } };
  }
};

// 한 달치 식단 생성하기
export const generateMonthlyMeals = async (startDate = null) => {
  try {
    const data = startDate ? { start_date: startDate } : {};
    console.log("식단 생성 요청:", data);
    
    const authHeader = getAuthHeader();
    console.log("식단 생성 요청 헤더:", authHeader);
    
    const response = await axios.post(
      `${API_URL}/meals/generate`, 
      data, 
      authHeader
    );
    console.log("식단 생성 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error('식단 생성 오류:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// 월별 식단 정보 가져오기
export const getMonthlyMeals = async (year, month) => {
  try {
    const authHeader = getAuthHeader();
    const response = await axios.get(
      `${API_URL}/meals/monthly?year=${year}&month=${month}`,
      authHeader
    );
    return response.data;
  } catch (error) {
    console.error('월별 식단 가져오기 오류:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// 특정 날짜의 식단 정보 가져오기
export const getMealByDate = async (date) => {
  try {
    // date는 'YYYY-MM-DD' 형식이어야 함
    console.log(`${date} 날짜 식단 정보 요청`);
    
    const authHeader = getAuthHeader();
    const response = await axios.get(
      `${API_URL}/meals/${date}`, 
      authHeader
    );
    console.log("날짜별 식단 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error('날짜별 식단 가져오기 오류:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// 특정 날짜의 식단 다시 생성하기
export const regenerateMeal = async (date) => {
  try {
    // date는 'YYYY-MM-DD' 형식이어야 함
    console.log(`${date} 날짜 식단 재생성 요청`);
    
    const authHeader = getAuthHeader();
    const response = await axios.post(
      `${API_URL}/meals/regenerate/${date}`, 
      {}, 
      authHeader
    );
    console.log("식단 재생성 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error('식단 재생성 오류:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data);
    }
    throw error;
  }
};

export const getMealNutritionByDate = async (date, token) => {
  try {
    const response = await fetch(
      `${API_URL}/meal-nutrition/${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || '영양소 정보 조회 실패');
    return data;
  } catch (error) {
    throw error;
  }
};