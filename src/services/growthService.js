import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const growthService = {
  // 성장 데이터 조회
  getGrowthData: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/height_weight?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('성장 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 성장 데이터 저장
  saveGrowthData: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/height_weight`, data);
      return response.data;
    } catch (error) {
      console.error('성장 데이터 저장 실패:', error);
      throw error;
    }
  },

  // 또래 비교 데이터 조회
  getPeerComparisonData: async (userId, startDate, endDate) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/get_growth_peer_data`, {
        params: {
          user_id: userId,
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('또래 비교 데이터 조회 실패:', error);
      throw error;
    }
  },

  // 성장 랭킹 조회
  getTopGrowthChildren: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/top_growth_children`);
      return response.data;
    } catch (error) {
      console.error('성장 랭킹 조회 실패:', error);
      throw error;
    }
  }
}; 