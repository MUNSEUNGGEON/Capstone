import React, { useCallback, memo } from 'react';

// memo를 사용하여 불필요한 리렌더링을 방지
const MyPageAddressField = memo(({ formData, setFormData }) => {

  // 다음 주소 API를 실행하여 우편번호/주소를 자동 입력
  const openPostcode = useCallback(() => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 주소 선택 완료 시, 우편번호와 기본 주소를 formData에 설정
        setFormData((prevData) => ({
          ...prevData,
          postal_address: data.zonecode, // 우편번호
          address: data.address          // 기본 주소
        }));
      }
    }).open(); // 다음 우편번호 창 열기
  }, [setFormData]);

  // input 필드 변경 처리 함수 (상세주소 등)
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // 변경된 필드 값만 업데이트
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }, [setFormData]);

  // 컴포넌트 UI 렌더링
  return (
    <>
      {/* 우편번호 입력 필드 및 검색 버튼 */}
      <div className="form-group">
        <label htmlFor="postal_address">우편번호 *</label>
        <div className="input-with-button">
          <input
            type="text"
            id="postal_address"
            name="postal_address"
            value={formData.postal_address}
            onChange={handleChange}
            readOnly // 사용자는 직접 입력 불가, 검색 버튼을 통해 입력됨
            placeholder="우편번호 검색을 눌러주세요."
            required
          />
          <button
            type="button"
            onClick={openPostcode} // 검색 버튼 클릭 시 주소 검색 실행
            className="check-button"
          >
            우편번호 검색
          </button>
        </div>
      </div>

      {/* 기본 주소 입력 필드 (자동 입력, 읽기 전용) */}
      <div className="form-group">
        <label htmlFor="address">주소 *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          readOnly // 사용자가 직접 입력하지 않음
          required
        />
      </div>

      {/* 상세 주소 입력 필드 (사용자가 직접 입력) */}
      <div className="form-group">
        <label htmlFor="address_detail">상세주소 *</label>
        <input
          type="text"
          id="address_detail"
          name="address_detail"
          value={formData.address_detail}
          onChange={handleChange}
          placeholder="상세주소를 입력해 주세요."
          required
        />
      </div>
    </>
  );
});

// 디버깅 및 개발자 도구에서 컴포넌트 이름 명확히 표시
MyPageAddressField.displayName = 'MyPageAddressField';

export default MyPageAddressField; 