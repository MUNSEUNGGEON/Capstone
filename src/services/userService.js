import { API_BASE_URL } from "./apiConfig"

// 사용자 프로필 업데이트
export const updateUserProfile = async (profileData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error("프로필 업데이트에 실패했습니다.")
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("프로필 업데이트 오류:", error)
    throw error
  }
}

// 사용자 비밀번호 변경
export const updateUserPassword = async (passwordData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "비밀번호 변경에 실패했습니다.")
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("비밀번호 변경 오류:", error)
    throw error
  }
}

// 사용자 알레르기 정보 조회 (productService와 동일한 방식)
export const getUserAllergies = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/allergies`)

    if (!response.ok) {
      throw new Error("알레르기 정보 조회에 실패했습니다.")
    }

    const data = await response.text()
    return data || ""
  } catch (error) {
    console.error("알레르기 정보 조회 오류:", error)
    return ""
  }
}

// 사용자 알레르기 정보 업데이트
export const updateUserAllergies = async (userId, allergies, token) => {
  try {
    const allergyString = Array.isArray(allergies) ? allergies.join(",") : allergies

    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/allergies`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ allergies: allergyString }),
    })

    if (!response.ok) {
      throw new Error("알레르기 정보 업데이트에 실패했습니다.")
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("알레르기 정보 업데이트 오류:", error)
    throw error
  }
}

// 전체 알레르기 목록 조회
export const getAllergies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/allergies`)

    if (!response.ok) {
      throw new Error("알레르기 목록 조회에 실패했습니다.")
    }

    const data = await response.json()
    return { success: true, allergies: data.allergies || [] }
  } catch (error) {
    console.error("알레르기 목록 조회 오류:", error)
    return { success: false, allergies: [] }
  }
}
