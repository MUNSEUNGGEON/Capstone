import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

// 인라인 스타일 정의 (번호 입력 필드 및 구분자)
const phoneInputStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  part: {
    flex: 1,
    width: 0,
    textAlign: 'center',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  partFocus: {
    outline: 'none',
    borderColor: '#4a90e2'
  },
  separator: {
    fontWeight: 'bold',
    padding: '0 2px'
  },
  placeholder: {
    color: '#aaa',
    fontSize: '14px'
  }
};

// 휴대폰 번호 입력 필드 컴포넌트
const PhoneField = memo(({ formData, setFormData }) => {
  const [phoneError, setPhoneError] = useState(''); // 오류 메시지 상태
  const [part1, setPart1] = useState(''); // 앞자리 (예: 010)
  const [part2, setPart2] = useState(''); // 중간자리
  const [part3, setPart3] = useState(''); // 끝자리

  // 각 입력창에 대한 ref 설정 (포커스 이동 용도)
  const part1Ref = useRef();
  const part2Ref = useRef();
  const part3Ref = useRef();

  // 전체 전화번호 유효성 검사
  const validatePhoneNumber = useCallback((phoneNumber) => {
    if (!phoneNumber) {
      setPhoneError('');
      return false;
    }

    const cleanNumber = phoneNumber.replace(/-/g, ''); // 하이픈 제거

    // 길이 체크
    if (cleanNumber.length < 10 || cleanNumber.length > 11) {
      setPhoneError('휴대폰 번호의 모든 자리를 입력해 주세요.');
      return false;
    }

    // 앞자리 유효성 확인
    const firstPart = cleanNumber.substring(0, 3);
    if (!['010', '011', '016', '017', '018', '019'].includes(firstPart)) {
      setPhoneError('유효한 휴대폰 번호를 입력해 주세요.');
      return false;
    }

    setPhoneError('');
    return true;
  }, []);

  // 입력값 처리 및 다음 입력창으로 포커스 이동
  const handleChange = useCallback((e, setter, maxLength, nextRef) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, maxLength); // 숫자만 허용

    setter(numericValue);

    // 입력이 완료되면 다음 입력창으로 포커스
    if (numericValue.length >= maxLength && nextRef) {
      nextRef.current.focus();
    }
  }, []);

  // 백스페이스로 이전 입력창으로 이동
  const handleKeyDown = useCallback((e, currentValue, prevRef) => {
    if (e.key === 'Backspace' && currentValue === '' && prevRef) {
      prevRef.current.focus();
    }
  }, []);

  // formData의 초기값이 있을 경우 입력창에 분해해서 설정
  useEffect(() => {
    if (formData.phone_number && typeof formData.phone_number === 'string') {
      const cleanedValue = formData.phone_number.replace(/[^0-9]/g, '');
      if (cleanedValue.length > 0) {
        setPart1(cleanedValue.substring(0, 3));
        setPart2(cleanedValue.substring(3, 7));
        setPart3(cleanedValue.substring(7, 11));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회만 실행

  // 각 파트 변경 시 전체 번호 결합 및 formData 업데이트
  useEffect(() => {
    const fullNumber = `${part1}${part2 ? '-' + part2 : ''}${part3 ? '-' + part3 : ''}`;
    const cleanNumber = fullNumber.replace(/^-|-$/, ''); // 양 끝 하이픈 제거

    setFormData(prevData => ({
      ...prevData,
      phone_number: cleanNumber
    }));

    validatePhoneNumber(cleanNumber);
  }, [part1, part2, part3]);

  return (
    <div className="form-group">
      <label htmlFor="phone_number">휴대폰번호 *</label>
      <div style={phoneInputStyles.container}>
        {/* 앞자리: 3자리 */}
        <input
          type="text"
          value={part1}
          onChange={(e) => handleChange(e, setPart1, 3, part2Ref)}
          maxLength={3}
          placeholder="010"
          ref={part1Ref}
          style={phoneInputStyles.part}
          required
          title="휴대폰 번호를 입력해주세요."
        />
        <span style={phoneInputStyles.separator}>-</span>

        {/* 중간자리: 4자리 */}
        <input
          type="text"
          value={part2}
          onChange={(e) => handleChange(e, setPart2, 4, part3Ref)}
          onKeyDown={(e) => handleKeyDown(e, part2, part1Ref)}
          maxLength={4}
          placeholder="0000"
          ref={part2Ref}
          style={phoneInputStyles.part}
          required
          title="휴대폰 번호를 입력해주세요."
        />
        <span style={phoneInputStyles.separator}>-</span>

        {/* 끝자리: 4자리 */}
        <input
          type="text"
          value={part3}
          onChange={(e) => handleChange(e, setPart3, 4)}
          onKeyDown={(e) => handleKeyDown(e, part3, part2Ref)}
          maxLength={4}
          placeholder="0000"
          ref={part3Ref}
          style={phoneInputStyles.part}
          required
          title="휴대폰 번호를 입력해주세요."
        />
      </div>

      {/* 유효성 오류 메시지 표시 */}
      {phoneError && <p className="error-message">{phoneError}</p>}
    </div>
  );
});

PhoneField.displayName = 'PhoneField';

export default PhoneField;
