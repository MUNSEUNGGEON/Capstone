import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// axios 인스턴스 생성 (baseURL과 timeout 설정)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const productService = {
  /**
   * 모든 상품 조회 (userId가 있으면 알레르기 반영 필터링)
   * @param {number} [userId] - 사용자 ID (선택)
   * @returns {Promise<Array>} 상품 리스트
   */
  getAllProducts: async (userId) => {
    try {
      const url = userId ? `/api/products?user_id=${userId}` : '/api/products';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('[productService.getAllProducts] 상품 목록 조회 실패:', error.message);
      throw error;
    }
  },

  /**
   * 상품 상세 정보 조회
   * @param {number|string} productId - 상품 ID
   * @returns {Promise<Object>} 상품 상세 정보
   */
  getProductDetail: async (productId) => {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('[productService.getProductDetail] 상품 상세 정보 조회 실패:', error.message);
      throw error;
    }
  },

  /**
   * 사용자 알레르기 정보 조회
   * @param {number|string} userId - 사용자 ID
   * @returns {Promise<Array>} 알레르기 ID 배열 또는 문자열 등 응답 형식에 따라 변동 가능
   */
  getUserAllergies: async (userId) => {
    try {
      const response = await apiClient.get(`/api/user_allergies/${userId}`);
      return response.data;
    } catch (error) {
      console.error('[productService.getUserAllergies] 사용자 알레르기 정보 조회 실패:', error.message);
      throw error;
    }
  },


  // 체크리스트 변동
  getAllProducts: async (userId, checkedAllergies = []) => {
    let url = '/api/products';

    const params = [];
    if (userId) params.push(`user_id=${userId}`);
    if (checkedAllergies.length > 0) params.push(`checked_allergies=${checkedAllergies.join(',')}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('[productService.getAllProducts] 상품 목록 조회 실패:', error.message);
      throw error;
    }
  }

};
