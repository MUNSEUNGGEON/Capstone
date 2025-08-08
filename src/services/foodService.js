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

// 음식 상세 정보 가져오기
export const getFoodDetail = async (foodId) => {
  try {
    console.log(`음식 ID: ${foodId} 상세 정보 요청`);
    
    // foodId가 이미 문자열 형식인지 확인
    const formattedId = typeof foodId === 'string' && foodId.startsWith('FD') 
      ? foodId  // 이미 FD로 시작하면 그대로 사용
      : foodId; // 아니면 그냥 숫자 사용
    
    console.log(`변환된 formattedId: ${formattedId}`);
    
    const authHeader = getAuthHeader();
    const response = await axios.get(
      `${API_URL}/food/${formattedId}`, 
      authHeader
    );
    console.log("음식 상세 정보 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error('음식 상세 정보 가져오기 오류:', error);
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data);
    }
    throw error;
  }
};

// 음식 영양소 정보 가져오기
export const getFoodNutrition = async (foodId) => {
  try {
    const authHeader = getAuthHeader();
    const response = await axios.get(
      `${API_URL}/food-nutrition/${foodId}`,
      authHeader
    );
    return response.data;
  } catch (error) {
    console.error('음식 영양소 가져오기 오류:', error);
    throw error;
  }
};