import React, { useState, useCallback, memo } from 'react';

// 인라인 스타일 정의: 생년월일(date) 입력과 성별 선택(select)에 적용
const childInfoStyles = {
  dateInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  dateInputFocus: {
    outline: 'none',
    borderColor: '#4a90e2'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    backgroundColor: 'white'
  },
  selectFocus: {
    outline: 'none',
    borderColor: '#4a90e2'
  }
};

// memo를 사용하여 불필요한 리렌더링 방지
const MyPageChildInfoField = memo(({ formData, setFormData }) => {
  // 이름 유효성 검사 에러 메시지 상태
  const [kidNameError, setKidNameError] = useState('');

  // 아이 이름 유효성 검사 함수
  const validateKidName = useCallback((name) => {
    if (!name) {
      setKidNameError('');
      return true;
    }

    // 한글 또는 영문만 허용, 특수문자/공백은 불가
    const nameRegex = /^[가-힣a-zA-Z]+$/;
    const isValid = nameRegex.test(name);

    if (!isValid) {
      setKidNameError('아이 이름은 한글, 영문만 사용 가능합니다. (특수문자, 공백 사용 불가)');
    } else {
      setKidNameError('');
    }

    return isValid;
  }, []);

  // 모든 입력 필드 값 변경 핸들러
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // formData 상태 업데이트
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    // 아이 이름 필드일 경우 유효성 검사 실행
    if (name === 'kid_name') {
      validateKidName(value);
    }
  }, [setFormData, validateKidName]);

  return (
    <>
      {/* 아이 이름 입력 필드 */}
      <div className="form-group">
        <label htmlFor="kid_name">아이 이름</label>
        <input
          type="text"
          id="kid_name"
          name="kid_name"
          value={formData.kid_name}
          readOnly
          disabled
          className="readonly-field"
          placeholder="아이 이름"
        />
        <small className="field-note">아이 이름은 변경할 수 없습니다.</small>
      </div>

      {/* 아이 성별 선택 필드 */}
      <div className="form-group">
        <label htmlFor="kid_gender">아이 성별</label>
        <select
          id="kid_gender"
          name="kid_gender"
          value={formData.kid_gender}
          disabled
          className="readonly-field"
          style={childInfoStyles.select}
        >
          <option value="">선택</option>
          <option value="남자">남자</option>
          <option value="여자">여자</option>
        </select>
        <small className="field-note">아이 성별은 변경할 수 없습니다.</small>
      </div>

      {/* 아이 생년월일 입력 필드 */}
      <div className="form-group">
        <label htmlFor="kid_birth">아이 생년월일</label>
        <input
          type="date"
          id="kid_birth"
          name="kid_birth"
          value={formData.kid_birth}
          readOnly
          disabled
          className="readonly-field"
          style={childInfoStyles.dateInput}
        />
        <small className="field-note">아이 생년월일은 변경할 수 없습니다.</small>
      </div>
    </>
  );
});

// 개발자 도구에서 컴포넌트 이름 표시
MyPageChildInfoField.displayName = 'MyPageChildInfoField';

export default MyPageChildInfoField; 