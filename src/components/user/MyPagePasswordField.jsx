import React, { useState, useCallback, memo } from 'react';

// 비밀번호 강도에 따른 메시지 정의
const passwordStrengthMessages = {
  unusable: '사용 불가: 영문 대/소문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.',
  medium: '보통: 안전한 비밀번호를 위해 다양한 문자를 사용하세요.',
  safe: '안전: 안전한 비밀번호입니다.'
};

const MyPagePasswordField = memo(({ onPasswordSubmit }) => {
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordStrength, setPasswordStrength] = useState(''); // 새 비밀번호 강도 상태
  
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });

  // 비밀번호 강도 검사 함수 (회원가입과 동일)
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

  // 입력값 변경 핸들러
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));

    // 실시간 유효성 검사
    if (name === 'new_password') {
      checkPasswordStrength(value);
      setErrors(prev => ({
        ...prev,
        new_password: ''
      }));
    }
    
    if (name === 'confirm_password') {
      const isMatch = value === passwords.new_password;
      setErrors(prev => ({
        ...prev,
        confirm_password: isMatch ? '' : '새 비밀번호와 일치하지 않습니다.'
      }));
    }

    // 현재 비밀번호 에러 초기화
    if (name === 'current_password') {
      setErrors(prev => ({
        ...prev,
        current_password: ''
      }));
    }
  }, [passwords.new_password, checkPasswordStrength]);

  // 비밀번호 표시/숨김 토글 (회원가입과 동일)
  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors = {};
    
    if (!passwords.current_password) {
      newErrors.current_password = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!passwords.new_password) {
      newErrors.new_password = '새 비밀번호를 입력해주세요.';
    } else if (passwordStrength === 'unusable') {
      newErrors.new_password = '영문 대/소문자, 숫자, 특수문자 중 2가지 이상을 포함해주세요.';
    }
    
    if (passwords.new_password !== passwords.confirm_password) {
      newErrors.confirm_password = '새 비밀번호와 일치하지 않습니다.';
    }
    
    if (passwords.current_password === passwords.new_password) {
      newErrors.new_password = '현재 비밀번호와 다른 비밀번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    
    // 에러가 없으면 제출
    if (Object.keys(newErrors).length === 0) {
      onPasswordSubmit({
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
    }
  }, [passwords, onPasswordSubmit, passwordStrength]);

  // 폼 초기화
  const handleReset = useCallback(() => {
    setPasswords({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setErrors({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordStrength('');
  }, []);

  return (
    <form onSubmit={handleSubmit} className="password-form">
      {/* 현재 비밀번호 */}
      <div className="form-group">
        <label htmlFor="current_password">현재 비밀번호 *</label>
        <div className="password-input-container">
          <input
            type={showPasswords.current_password ? "text" : "password"}
            id="current_password"
            name="current_password"
            value={passwords.current_password}
            onChange={handleChange}
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => togglePasswordVisibility('current_password')}
            aria-label={showPasswords.current_password ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <span className={`eye-icon ${showPasswords.current_password ? 'visible' : ''}`}></span>
          </button>
        </div>
        {errors.current_password && (
          <p className="error-message">{errors.current_password}</p>
        )}
      </div>

      {/* 새 비밀번호 */}
      <div className="form-group">
        <label htmlFor="new_password">새 비밀번호 *</label>
        <div className="password-input-container">
          <input
            type={showPasswords.new_password ? "text" : "password"}
            id="new_password"
            name="new_password"
            value={passwords.new_password}
            onChange={handleChange}
            placeholder="8~16자 영문 대/소문자, 숫자, 특수문자 중 2가지 이상 조합"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => togglePasswordVisibility('new_password')}
            aria-label={showPasswords.new_password ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <span className={`eye-icon ${showPasswords.new_password ? 'visible' : ''}`}></span>
          </button>
        </div>

        {/* 비밀번호 강도 시각화 및 메시지 */}
        {passwords.new_password && (
          <div className="password-strength-container">
            <div className={`password-strength-bar ${getPasswordStrengthClass()}`}></div>
            <p className={`password-strength-message ${getPasswordStrengthClass()}`}>
              {getPasswordStrengthMessage()}
            </p>
          </div>
        )}

        {errors.new_password && (
          <p className="error-message">{errors.new_password}</p>
        )}
      </div>

      {/* 새 비밀번호 확인 */}
      <div className="form-group">
        <label htmlFor="confirm_password">새 비밀번호 확인 *</label>
        <div className="password-input-container">
          <input
            type={showPasswords.confirm_password ? "text" : "password"}
            id="confirm_password"
            name="confirm_password"
            value={passwords.confirm_password}
            onChange={handleChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => togglePasswordVisibility('confirm_password')}
            aria-label={showPasswords.confirm_password ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <span className={`eye-icon ${showPasswords.confirm_password ? 'visible' : ''}`}></span>
          </button>
        </div>
        {errors.confirm_password && (
          <p className="error-message">{errors.confirm_password}</p>
        )}
      </div>

      <div className="password-button-group">
        <button type="submit" className="save-btn">
          비밀번호 변경
        </button>
        <button type="button" className="cancel-btn" onClick={handleReset}>
          초기화
        </button>
      </div>
    </form>
  );
});

MyPagePasswordField.displayName = 'MyPagePasswordField';

export default MyPagePasswordField; 