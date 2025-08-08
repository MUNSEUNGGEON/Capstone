"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import MenuBar from "../common/MenuBar"
import MyPageMenuBar from "./MyPageMenuBar"
import { updateUserProfile, updateUserAllergies, updateUserPassword } from "../../services/userService"
import { productService } from "../../services/productService"
import MyPageIdField from "./MyPageIdField"
import MyPageNameField from "./MyPageNameField"
import MyPageEmailField from "./MyPageEmailField"
import MyPagePhoneField from "./MyPagePhoneField"
import MyPageAddressField from "./MyPageAddressField"
import MyPageChildInfoField from "./MyPageChildInfoField"
import MyPageAllergyField from "./MyPageAllergyField"
import MyPagePasswordField from "./MyPagePasswordField"
import "./MyPage.css"

const MyPage = ({ userInfo, setUserInfo }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState("profile")

  // 프로필 정보 상태 (이메일을 분리하여 처리)
  const [profileData, setProfileData] = useState({
    user_id: "",
    name: "",
    email: "",
    email_id: "",
    email_domain: "",
    phone_number: "",
    postal_address: "",
    address: "",
    address_detail: "",
    kid_name: "",
    kid_gender: "",
    kid_birth: "",
  })

  // 알레르기 정보 상태
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [originalAllergies, setOriginalAllergies] = useState([])

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 날짜 형식 변환 함수
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""

    try {
      // 다양한 날짜 형식 처리
      let date
      if (dateString.includes("GMT") || dateString.includes("T")) {
        date = new Date(dateString)
      } else if (dateString.includes("-")) {
        // YYYY-MM-DD 형식은 그대로 반환
        return dateString.split("T")[0] // 시간 부분 제거
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date.getTime())) {
        return ""
      }

      // YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      return `${year}-${month}-${day}`
    } catch (error) {
      console.error("날짜 형식 변환 오류:", error)
      return ""
    }
  }

  // 이메일을 분리하는 함수
  const splitEmail = (email) => {
    if (!email) return { email_id: "", email_domain: "" }
    
    const parts = email.split("@")
    if (parts.length !== 2) return { email_id: "", email_domain: "" }
    
    return {
      email_id: parts[0],
      email_domain: parts[1]
    }
  }

  // 주소를 분리하는 함수
  const splitAddress = (address) => {
    if (!address) return { address: "", address_detail: "" }
    
    // 이미 분리된 주소인 경우
    if (address.includes(", ")) {
      const parts = address.split(", ")
      if (parts.length < 2) return { address: address, address_detail: "" }
      
      return {
        address: parts[0],
        address_detail: parts.slice(1).join(", ")
      }
    }
    
    // 단일 주소인 경우
    return { address: address, address_detail: "" }
  }

  useEffect(() => {
    if (!userInfo) {
      navigate("/login")
      return
    }

    loadUserData()
  }, [userInfo, navigate])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError("")

      const kidBirth = userInfo.kid_birth || userInfo.Child_birth || ""
      const emailParts = splitEmail(userInfo.email || userInfo.User_email || "")
      const addressParts = splitAddress(userInfo.address || userInfo.User_address || "")

      setProfileData({
        user_id: userInfo.id || userInfo.user_id || userInfo.User_id || "",
        name: userInfo.name || userInfo.User_name || "",
        email: userInfo.email || userInfo.User_email || "",
        email_id: emailParts.email_id,
        email_domain: emailParts.email_domain,
        phone_number: userInfo.phone_number || userInfo.User_phone || "",
        postal_address: userInfo.postal_address || userInfo.Postal_address || "",
        address: addressParts.address,
        address_detail: addressParts.address_detail,
        kid_name: userInfo.kid_name || userInfo.Kid_name || userInfo.Child_name || "",
        kid_gender: userInfo.kid_gender || userInfo.Kid_gender || userInfo.Child_gender || "",
        kid_birth: formatDateForInput(kidBirth),
      })

      console.log("로드된 사용자 정보:", userInfo)
      console.log("설정된 프로필 데이터:", {
        user_id: userInfo.id || userInfo.user_id || userInfo.User_id || "",
        name: userInfo.name || userInfo.User_name || "",
        email: userInfo.email || userInfo.User_email || "",
        postal_address: userInfo.postal_address || "",
        address: addressParts.address,
        address_detail: addressParts.address_detail,
        kid_name: userInfo.kid_name || userInfo.Kid_name || userInfo.Child_name || "",
        kid_gender: userInfo.kid_gender || userInfo.Kid_gender || userInfo.Child_gender || "",
        kid_birth: formatDateForInput(kidBirth),
      })

      // 사용자 알레르기 정보 로드
      if (userInfo.User_id || userInfo.user_id) {
        const userId = userInfo.User_id || userInfo.user_id
        try {
          const userAllergiesResponse = await productService.getUserAllergies(userId)

          let userAllergyIds = []
          if (typeof userAllergiesResponse === "string" && userAllergiesResponse.trim()) {
            userAllergyIds = userAllergiesResponse
              .split(",")
              .map((id) => Number.parseInt(id.trim()))
              .filter((id) => !isNaN(id))
          } else if (Array.isArray(userAllergiesResponse)) {
            userAllergyIds = userAllergiesResponse
              .map((item) => (typeof item === "number" ? item : item.Allerg_id || item.allergy_id))
              .filter((id) => id !== undefined)
          }

          setSelectedAllergies(userAllergyIds)
          setOriginalAllergies([...userAllergyIds])
        } catch (allergyError) {
          console.error("알레르기 정보 로드 실패:", allergyError)
          setSelectedAllergies([])
          setOriginalAllergies([])
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError("")
      setMessage("")

      const token = userInfo.token
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.")
      }

      // 저장할 데이터 준비 (이메일과 주소 합치기)
      const dataToSave = {
        ...profileData,
        email: profileData.email, // 이미 합쳐진 이메일
        address: profileData.address_detail 
          ? `${profileData.address}, ${profileData.address_detail}`
          : profileData.address
      }

      console.log("저장할 프로필 데이터:", dataToSave)

      // 프로필 정보 업데이트
      await updateUserProfile(dataToSave, token)

      // 알레르기 정보 업데이트 (변경된 경우에만)
      const allergyChanged = JSON.stringify(selectedAllergies.sort()) !== JSON.stringify(originalAllergies.sort())
      if (allergyChanged) {
        const userId = userInfo.User_id || userInfo.user_id
        await updateUserAllergies(userId, selectedAllergies, token)
        setOriginalAllergies([...selectedAllergies])
      }

      // localStorage의 사용자 정보 업데이트
      const updatedUserInfo = {
        ...userInfo,
        ...dataToSave,
      }
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo))
      setUserInfo(updatedUserInfo)

      setMessage("정보가 성공적으로 업데이트되었습니다.")
    } catch (err) {
      console.error("저장 오류:", err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (passwordData) => {
    try {
      setSaving(true)
      setError("")
      setMessage("")

      const token = userInfo.token
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.")
      }

      await updateUserPassword(passwordData, token)
      setMessage("비밀번호가 성공적으로 변경되었습니다.")
    } catch (err) {
      console.error("비밀번호 변경 오류:", err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // 원래 데이터로 복원
    const kidBirth = userInfo.kid_birth || userInfo.Child_birth || ""
    const emailParts = splitEmail(userInfo.email || userInfo.User_email || "")
    const addressParts = splitAddress(userInfo.address || userInfo.User_address || "")

    setProfileData({
      user_id: userInfo.id || userInfo.user_id || userInfo.User_id || "",
      name: userInfo.name || userInfo.User_name || "",
      email: userInfo.email || userInfo.User_email || "",
      email_id: emailParts.email_id,
      email_domain: emailParts.email_domain,
      phone_number: userInfo.phone_number || userInfo.User_phone || "",
      postal_address: userInfo.postal_address || "",
      address: addressParts.address,
      address_detail: addressParts.address_detail,
      kid_name: userInfo.kid_name || userInfo.Kid_name || userInfo.Child_name || "",
      kid_gender: userInfo.kid_gender || userInfo.Kid_gender || userInfo.Child_gender || "",
      kid_birth: formatDateForInput(kidBirth),
    })
    setSelectedAllergies([...originalAllergies])
    setMessage("")
    setError("")
  }

  if (loading) {
    return (
      <div className="mypage-container">
        <MenuBar />
        <div className="loading-message">사용자 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="mypage-container">
      <MenuBar />
      <MyPageMenuBar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      <div className="mypage-content-wrapper">
        <div className="mypage-header">
          <h1>마이페이지</h1>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="mypage-content">
          {activeSection === "profile" && (
            <div className="profile-section">
              <h2 className="section-title">회원정보 수정</h2>
                          <form className="profile-form">
              <MyPageIdField formData={profileData} />
              <MyPageNameField formData={profileData} setFormData={setProfileData} />
              <MyPageEmailField formData={profileData} setFormData={setProfileData} />
              <MyPagePhoneField formData={profileData} setFormData={setProfileData} />
              <MyPageAddressField formData={profileData} setFormData={setProfileData} />
              <MyPageChildInfoField formData={profileData} setFormData={setProfileData} />
            </form>
            </div>
          )}

          {activeSection === "password" && (
            <div className="password-section">
              <h2 className="section-title">비밀번호 변경</h2>
              <MyPagePasswordField onPasswordSubmit={handlePasswordChange} />
            </div>
          )}

          {activeSection === "allergy" && (
            <div className="allergy-section">
              <h2 className="section-title">알레르기 정보 수정</h2>
              <MyPageAllergyField 
                selectedAllergies={selectedAllergies} 
                setSelectedAllergies={setSelectedAllergies} 
              />
            </div>
          )}
        </div>

        {(activeSection === "profile" || activeSection === "allergy") && (
          <div className="button-group">
            <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
            <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPage
