import React, { useState } from 'react';
import axios from 'axios';

// 아이디 입력 및 중복확인 필드
const IdField = ({ formData, setFormData, idChecked, setIdChecked }) => {
  const [idMessage, setIdMessage] = useState('');              // 중복확인 결과 메시지
  const [idCheckLoading, setIdCheckLoading] = useState(false); // 중복확인 중 로딩 상태
  const [idValidationError, setIdValidationError] = useState(''); // 형식 오류 메시지

  // 아이디 형식 유효성 검사 (영문, 숫자 4~16자)
  const validateId = (id) => {
    const idRegex = /^[a-zA-Z0-9]{4,16}$/;
    return idRegex.test(id);
  };

  // 입력창의 값이 바뀔 때 처리
  const handleChange = (e) => {
    const { value } = e.target;

    // formData 상태 업데이트
    setFormData((prevData) => ({
      ...prevData,
      id: value
    }));

    // 새로 입력하면 중복확인 상태 초기화
    setIdChecked(false);
    setIdMessage('');

    // 빈 값 또는 유효성 오류 검사
    if (!value) {
      setIdValidationError('');
    } else if (!validateId(value)) {
      setIdValidationError('아이디는 4~16자의 영문, 숫자만 사용 가능합니다. (특수문자, 공백 사용 불가)');
    } else {
      setIdValidationError('');
    }
  };

  // 중복확인 버튼 클릭 시 처리
  const checkIdDuplicate = async () => {
    // 빈 값 또는 형식 오류가 있을 경우
    if (!formData.id) {
      setIdMessage('아이디를 입력해 주세요.');
      return;
    }

    if (!validateId(formData.id)) {
      setIdMessage('아이디: 4~16자의 영문, 숫자만 사용 가능합니다. (특수문자, 공백 사용 불가)');
      return;
    }

    setIdCheckLoading(true); // 로딩 시작
    try {
      // 서버에 POST 요청으로 아이디 중복 여부 확인
      const response = await axios.post('http://127.0.0.1:5000/api/check-id', { id: formData.id });

      if (response.data.success) {
        setIdMessage('사용 가능한 아이디입니다.');
        setIdChecked(true); // 사용 가능
      } else {
        setIdMessage(response.data.message || '이미 존재하는 아이디입니다.');
        setIdChecked(false); // 사용 불가
      }
    } catch (err) {
      setIdMessage('중복 확인 중 오류가 발생했습니다.');
      setIdChecked(false);
    } finally {
      setIdCheckLoading(false); // 로딩 종료
    }
  };

  // 렌더링되는 UI
  return (
    <div className="form-group">
      <label htmlFor="id">아이디 *</label>
      <div className="input-with-button">
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          placeholder="4~16자의 영문, 숫자만 사용 가능"
        />
        <button
          type="button"
          onClick={checkIdDuplicate}
          disabled={idCheckLoading || idValidationError} // 로딩 중이거나 오류 시 비활성화
          className="check-button"
        >
          {idCheckLoading ? '확인 중...' : '중복확인'}
        </button>
      </div>

      {/* 유효성 검사 에러 메시지 */}
      {idValidationError && <p className="error-message">{idValidationError}</p>}

      {/* 중복확인 메시지 (성공/실패에 따라 스타일 변경) */}
      {idMessage && !idValidationError && (
        <p className={idChecked ? 'success-message' : 'error-message'}>
          {idMessage}
        </p>
      )}
    </div>
  );
};

export default IdField;
