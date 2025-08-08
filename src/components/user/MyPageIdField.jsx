import React from 'react';

// 마이페이지용 아이디 필드 컴포넌트 (읽기 전용)
const MyPageIdField = ({ formData }) => {
  return (
    <div className="form-group">
      <label htmlFor="user_id">아이디</label>
      <input
        type="text"
        id="user_id"
        name="user_id"
        value={formData.user_id || ''}
        readOnly
        disabled
        className="readonly-field"
        placeholder="회원가입 시 입력한 아이디"
      />
      <small className="field-note">아이디는 변경할 수 없습니다.</small>
    </div>
  );
};

export default MyPageIdField; 