import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const recommendedMealService = {
  /**
   * 나이를 기반으로 권장 영양소 정보를 가져옵니다.
   * @param {number} age 사용자 나이
   */
  getRecommendedNutrition: async (age) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recommended-meal/${age}`);
      return response.data;
    } catch (error) {
      console.error('권장 영양소 조회 실패:', error);
      throw error;
    }
  }
};
