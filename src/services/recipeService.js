import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const recipeService = {
  // 레시피 목록 조회 (옵션: userId, checkedAllergies)
  getAllRecipes: async (userId = null, checkedAllergies = []) => {
    let url = `${API_BASE_URL}/api/recipes`;

    const params = [];
    if (userId) params.push(`user_id=${userId}`);
    if (checkedAllergies.length > 0) {
      params.push(`checked_allergies=${checkedAllergies.join(',')}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('[recipeService.getAllRecipes] 레시피 목록 조회 실패:', error.message);
      throw error;
    }
  },

  // 레시피 상세 정보 조회
  getRecipeDetail: async (foodId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/${foodId}`);
      return response.data;
    } catch (error) {
      console.error('레시피 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 조리법 조회
  getRecipeCooking: async (foodId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/${foodId}/cooking`);
      return response.data;
    } catch (error) {
      console.error('레시피 조리법 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 조회수 증가
  increaseViewCount: async (foodId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recipe/${foodId}/view`);
      return response.data;
    } catch (error) {
      console.error('레시피 조회수 증가 실패:', error);
      throw error;
    }
  },

  // 사용자 알레르기 정보 조회
  getUserAllergies: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user_allergies/${userId}`);
      return response.data;
    } catch (error) {
      console.error('사용자 알레르기 정보 조회 실패:', error);
      throw error;
    }
  }

}; 