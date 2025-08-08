import React, { useState, useCallback, memo } from 'react';

// 이메일 도메인 선택 옵션
const domainOptions = [
  '직접입력',
  'gmail.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  'yahoo.com'
];

// memo로 컴포넌트 리렌더링 최적화
const MyPageEmailField = memo(({ formData, setFormData }) => {
  const [emailIdError, setEmailIdError] = useState('');           // 이메일 아이디 유효성 에러
  const [emailDomainError, setEmailDomainError] = useState('');   // 이메일 도메인 유효성 에러
  const [selectedDomain, setSelectedDomain] = useState('직접입력'); // 선택된 도메인

  // 이메일 아이디 유효성 검사 (영문/숫자만 허용)
  const validateEmailId = useCallback((emailId) => {
    if (!emailId) return true;
    const emailIdRegex = /^[a-zA-Z0-9]+$/;
    return emailIdRegex.test(emailId);
  }, []);

  // 이메일 도메인 유효성 검사 (예: naver.com, domain.co.kr)
  const validateEmailDomain = useCallback((domain) => {
    if (!domain) return true;
    const domainRegex = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }, []);

  // 전체 이메일 주소를 업데이트 (id@domain 형식)
  const updateEmail = useCallback((id, domain) => {
    if (id && domain) {
      setFormData((prevData) => ({
        ...prevData,
        email: `${id}@${domain}`
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        email: ''
      }));
    }
  }, [setFormData]);

  // 이메일 아이디, 도메인 입력 시 처리 함수
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    // 아이디 유효성 검사 및 에러 표시
    if (name === 'email_id') {
      if (value && !validateEmailId(value)) {
        setEmailIdError('이메일은 영문, 숫자만 사용 가능합니다.');
      } else {
        setEmailIdError('');
      }
    }

    // 도메인이 직접입력일 경우에만 유효성 검사
    if (name === 'email_domain' && selectedDomain === '직접입력') {
      if (value && !validateEmailDomain(value)) {
        setEmailDomainError('도메인 형식이 올바르지 않습니다. (예: naver.com, domain.co.kr)');
      } else {
        setEmailDomainError('');
      }
    }

    // 전체 이메일 주소 재조합
    if (name === 'email_id' || name === 'email_domain') {
      updateEmail(
        name === 'email_id' ? value : formData.email_id,
        name === 'email_domain' ? value : formData.email_domain
      );
    }
  }, [formData.email_id, formData.email_domain, selectedDomain, setFormData, updateEmail, validateEmailDomain, validateEmailId]);

  // 도메인 선택 시 처리 함수
  const handleDomainChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedDomain(value);

    if (value !== '직접입력') {
      // 선택된 도메인을 email_domain에 설정
      setFormData((prevData) => ({
        ...prevData,
        email_domain: value
      }));
      setEmailDomainError('');
    } else {
      // 직접입력을 선택한 경우 빈 문자열로 초기화
      setFormData((prevData) => ({
        ...prevData,
        email_domain: ''
      }));
    }

    // 이메일 전체 주소 재조합
    updateEmail(formData.email_id, value !== '직접입력' ? value : '');
  }, [formData.email_id, setFormData, updateEmail]);

  return (
    <div className="form-group">
      <label htmlFor="email_id">이메일 *</label>
      <div className="email-input-container">
        {/* 이메일 아이디 입력 */}
        <input
          type="text"
          id="email_id"
          name="email_id"
          value={formData.email_id}
          onChange={handleChange}
          placeholder="이메일"
          className="email-id-input"
          required
        />
        <span className="email-at">@</span>

        {/* 도메인 입력 (직접입력만 가능) */}
        <input
          type="text"
          id="email_domain"
          name="email_domain"
          value={formData.email_domain}
          onChange={handleChange}
          placeholder="example.com"
          className="email-domain-input"
          disabled={selectedDomain !== '직접입력'} // 직접입력일 때만 수정 가능
          required
        />

        {/* 도메인 선택 드롭다운 */}
        <select
          value={selectedDomain}
          onChange={handleDomainChange}
          className="email-domain-select"
          required
        >
          {domainOptions.map((domain, index) => (
            <option key={index} value={domain}>{domain}</option>
          ))}
        </select>
      </div>

      {/* 유효성 검사 에러 메시지 */}
      {emailIdError && <p className="error-message">{emailIdError}</p>}
      {emailDomainError && <p className="error-message">{emailDomainError}</p>}
    </div>
  );
});

// 개발자 도구에서 이름 명확히 표시
MyPageEmailField.displayName = 'MyPageEmailField';

export default MyPageEmailField; 