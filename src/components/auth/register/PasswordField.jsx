import React, { useState, useCallback, memo } from 'react';

// 비밀번호 강도에 따른 메시지 정의
const passwordStrengthMessages = {
  unusable: '사용 불가: 영문 대/소문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.',
  medium: '보통: 안전한 비밀번호를 위해 다양한 문자를 사용하세요.',
  safe: '안전: 안전한 비밀번호입니다.'
};

// 비밀번호 필드 컴포넌트
const PasswordField = memo(({ formData, setFormData, fieldErrors }) => {
  const [passwordStrength, setPasswordStrength] = useState(''); // 비밀번호 강도 상태
  const [passwordVisible, setPasswordVisible] = useState(false); // 비밀번호 보기 여부
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // 확인 비밀번호 보기 여부

  // 비밀번호 입력 시 상태 업데이트 및 강도 확인
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // 비밀번호 및 확인 비밀번호 formData 업데이트
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    // 비밀번호 입력 시 강도 검사 실행
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  }, [setFormData]);

  // 비밀번호 강도 검사 함수
  const checkPasswordStrength = useCallback((password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    // 길이 체크 (8~16자)
    if (password.length < 8 || password.length > 16) {
      setPasswordStrength('unusable');
      return;
    }

    // 각 문자 종류별 포함 여부 확인
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    // 포함된 문자 종류 수 체크
    const conditionsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
      .filter(Boolean).length;

    // 강도 결정
    if (conditionsMet >= 3) {
      setPasswordStrength('safe');
    } else if (conditionsMet === 2) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('unusable');
    }
  }, []);

  // 강도별 클래스 반환
  const getPasswordStrengthClass = useCallback(() => {
    if (!passwordStrength) return '';
    return `password-strength-${passwordStrength}`;
  }, [passwordStrength]);

  // 강도별 메시지 반환
  const getPasswordStrengthMessage = useCallback(() => {
    if (!passwordStrength) return '';
    return passwordStrengthMessages[passwordStrength];
  }, [passwordStrength]);

  // 비밀번호 보기 토글
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  // 비밀번호 확인 필드 보기 토글
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setConfirmPasswordVisible(prev => !prev);
  }, []);

  return (
    <>
      {/* 비밀번호 입력 필드 */}
      <div className="form-group">
        <label htmlFor="password">비밀번호 *</label>
        <div className="password-input-container">
          <input
            type={passwordVisible ? "text" : "password"} // 표시/숨김 상태 전환
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="8~16자 영문 대/소문자, 숫자, 특수문자 중 2가지 이상 조합"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <span className={`eye-icon ${passwordVisible ? 'visible' : ''}`}></span>
          </button>
        </div>

        {/* 비밀번호 강도 시각화 및 메시지 */}
        {formData.password && (
          <div className="password-strength-container">
            <div className={`password-strength-bar ${getPasswordStrengthClass()}`}></div>
            <p className={`password-strength-message ${getPasswordStrengthClass()}`}>
              {getPasswordStrengthMessage()}
            </p>
          </div>
        )}
      </div>

      {/* 비밀번호 확인 입력 필드 */}
      <div className="form-group">
        <label htmlFor="confirmPassword">비밀번호 확인 *</label>
        <div className="password-input-container">
          <input
            type={confirmPasswordVisible ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={confirmPasswordVisible ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <span className={`eye-icon ${confirmPasswordVisible ? 'visible' : ''}`}></span>
          </button>
        </div>

        {/* 비밀번호 불일치 에러 메시지 */}
        {fieldErrors?.confirmPassword && (
          <p className="error-message">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>
    </>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
