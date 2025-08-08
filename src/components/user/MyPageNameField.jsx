import React, { useState } from 'react';

// 마이페이지용 이름 입력 필드 컴포넌트
const MyPageNameField = ({ formData, setFormData }) => {
  const [nameError, setNameError] = useState(''); // 이름 유효성 검사 오류 메시지 상태

  // 입력값 변경 시 실행
  const handleChange = (e) => {
    const { value } = e.target;

    // 이름 값을 formData 상태에 반영
    setFormData((prevData) => ({
      ...prevData,
      name: value
    }));

    // 입력값 유효성 검사
    validateName(value);
  };

  // 이름 유효성 검사 함수 (한글 또는 영문만 허용)
  const validateName = (name) => {
    if (!name) {
      setNameError(''); // 값이 없을 경우 에러 메시지 제거
      return false;
    }

    const nameRegex = /^[가-힣a-zA-Z]+$/; // 한글 또는 영문만 허용, 숫자/특수문자/공백은 허용 안됨
    const isValid = nameRegex.test(name);

    if (!isValid) {
      setNameError('이름은 한글, 영문만 사용 가능합니다. (특수문자, 공백 사용 불가)');
    } else {
      setNameError('');
    }

    return isValid;
  };

  // 렌더링되는 이름 입력 UI
  return (
    <div className="form-group">
      <label htmlFor="name">이름</label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        readOnly
        disabled
        className="readonly-field"
        placeholder="이름"
      />
      <small className="field-note">이름은 변경할 수 없습니다.</small>
    </div>
  );
};

export default MyPageNameField; 