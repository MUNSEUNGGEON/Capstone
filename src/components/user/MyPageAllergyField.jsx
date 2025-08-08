import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';

// memo를 사용하여 불필요한 리렌더링 방지
const MyPageAllergyField = memo(({ selectedAllergies, setSelectedAllergies }) => {
  // 전체 알레르기 목록 상태
  const [allergies, setAllergies] = useState([]);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 알레르기 데이터 가져오기
  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        // Flask 서버에서 알레르기 데이터 가져오기
        const response = await axios.get('http://127.0.0.1:5000/api/allergies');
        if (response.data.success) {
          // 성공적으로 데이터를 받아왔을 경우 상태 저장
          setAllergies(response.data.allergies);
        } else {
          setError('알레르기 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        // 서버 오류 발생 시 에러 메시지 표시
        setError('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchAllergies();
  }, []);

  // 알레르기 체크박스를 클릭했을 때 선택 상태 토글
  const handleAllergyToggle = useCallback((allergyId) => {
    setSelectedAllergies(prev => {
      // 이미 선택되어 있다면 제거, 아니면 추가
      if (prev.includes(allergyId)) {
        return prev.filter(id => id !== allergyId);
      } else {
        return [...prev, allergyId];
      }
    });
  }, [setSelectedAllergies]);

  // 알레르기 목록 렌더링 함수
  const renderAllergyCheckboxes = useCallback(() => {
    if (loading) {
      return <p>알레르기 정보를 불러오는 중...</p>;
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    // 알레르기 항목들을 체크박스로 렌더링
    return (
      <div className="allergy-checkboxes">
        {allergies.map((allergy) => (
          <label key={allergy.Allerg_id} className="allergy-checkbox-label">
            <input
              type="checkbox"
              checked={selectedAllergies.includes(allergy.Allerg_id)}
              onChange={() => handleAllergyToggle(allergy.Allerg_id)}
              className="allergy-checkbox"
            />
            <span>{allergy.name}</span>
          </label>
        ))}
      </div>
    );
  }, [allergies, error, handleAllergyToggle, loading, selectedAllergies]);

  // 전체 컴포넌트 렌더링
  return (
    <div className="form-group">
      <label>아이 알레르기 정보</label>
      <div className="allergy-section">
        <p className="allergy-description">해당하는 알레르기가 있으면 선택해 주세요.</p>
        {renderAllergyCheckboxes()}
      </div>
    </div>
  );
});

// 디버깅 및 도구에서 표시될 컴포넌트 이름
MyPageAllergyField.displayName = 'MyPageAllergyField';

export default MyPageAllergyField; 