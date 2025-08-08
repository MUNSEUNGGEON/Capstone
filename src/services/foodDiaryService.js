import { API_URL } from './apiConfig';

// 식단일지 저장
export const saveFoodDiary = async (diaryData, userInfoParam = null) => {
  try {
    let userInfo = userInfoParam; // props로 받은 userInfo 우선 사용
    
    // props로 받은 userInfo가 없으면 localStorage에서 읽기
    if (!userInfo || (!userInfo.user_id && !userInfo.User_id)) {
      const userInfoString = localStorage.getItem('userInfo');
      
      try {
        userInfo = JSON.parse(userInfoString || '{}');
      } catch (parseError) {
        userInfo = {};
      }
    }
    
    // User_id (대문자) 또는 user_id (소문자) 둘 다 확인
    const userId = userInfo?.User_id || userInfo?.user_id;
    
    if (!userInfo || !userId) {
      throw new Error('로그인이 필요합니다. 사용자 정보를 찾을 수 없습니다.');
    }
    
    const requestData = {
      user_id: userId,
      ...diaryData
    };

    const response = await fetch(`${API_URL}/food-diary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '식단일지 저장에 실패했습니다.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 식단일지 조회
export const getFoodDiary = async (year, month, userInfoParam = null) => {
  try {
    let userInfo = userInfoParam; // props로 받은 userInfo 우선 사용
    
    // props로 받은 userInfo가 없으면 localStorage에서 읽기
    if (!userInfo || (!userInfo.user_id && !userInfo.User_id)) {
      const userInfoString = localStorage.getItem('userInfo');
      
      try {
        userInfo = JSON.parse(userInfoString || '{}');
      } catch (parseError) {
        userInfo = {};
      }
    }
    
    // User_id (대문자) 또는 user_id (소문자) 둘 다 확인
    const userId = userInfo?.User_id || userInfo?.user_id;
    
    if (!userInfo || !userId) {
      throw new Error('로그인이 필요합니다. 사용자 정보를 찾을 수 없습니다.');
    }

    const response = await fetch(`${API_URL}/food-diary/${userId}?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '식단일지 조회에 실패했습니다.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 특정 날짜의 식단일지 조회
export const getFoodDiaryByDate = async (date) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_URL}/food-diary/${userInfo.user_id}/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '식단일지 조회에 실패했습니다.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 식단일지 업데이트
export const updateFoodDiary = async (diaryId, diaryData) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_URL}/food-diary/${diaryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userInfo.user_id,
        ...diaryData
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '식단일지 업데이트에 실패했습니다.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 식단일지 삭제
export const deleteFoodDiary = async (diaryId) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_URL}/food-diary/${diaryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userInfo.user_id
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '식단일지 삭제에 실패했습니다.');
    }

    return data;
  } catch (error) {
    throw error;
  }
}; 