import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

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

const PhoneInputField = ({ value, onChange, name, required }) => {
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [part3, setPart3] = useState('');
  
  const part1Ref = useRef();
  const part2Ref = useRef();
  const part3Ref = useRef();

  // 초기값이 있는 경우 처리
  useEffect(() => {
    if (value && typeof value === 'string') {
      const cleanedValue = value.replace(/[^0-9]/g, '');
      if (cleanedValue.length > 0) {
        if (cleanedValue.length <= 3) {
          setPart1(cleanedValue);
        } else if (cleanedValue.length <= 7) {
          setPart1(cleanedValue.substring(0, 3));
          setPart2(cleanedValue.substring(3));
        } else {
          setPart1(cleanedValue.substring(0, 3));
          setPart2(cleanedValue.substring(3, 7));
          setPart3(cleanedValue.substring(7, 11));
        }
      }
    }
  }, []);

  // 입력값 변경 시 부모 컴포넌트로 값 전달
  useEffect(() => {
    const fullNumber = `${part1}${part2 ? '-' + part2 : ''}${part3 ? '-' + part3 : ''}`;
    const cleanNumber = fullNumber.replace(/^-|-$/, '');
    
    onChange({ target: { name, value: cleanNumber } });
  }, [part1, part2, part3, onChange, name]);

  // 숫자만 입력 가능하도록 처리하는 함수
  const handleChange = (e, setter, maxLength, nextRef) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setter(numericValue);
    
    // 최대 길이에 도달하면 다음 입력 칸으로 포커스 이동
    if (numericValue.length >= maxLength && nextRef) {
      nextRef.current.focus();
    }
  };

  // 백스페이스 처리
  const handleKeyDown = (e, currentValue, prevRef) => {
    if (e.key === 'Backspace' && currentValue === '' && prevRef) {
      prevRef.current.focus();
    }
  };

  return (
    <div style={phoneInputStyles.container}>
      <input
        type="text"
        value={part1}
        onChange={(e) => handleChange(e, setPart1, 3, part2Ref)}
        maxLength={3}
        placeholder="010"
        ref={part1Ref}
        style={phoneInputStyles.part}
        required={required}
        title="휴대폰 번호를 입력해주세요."
      />
      <span style={phoneInputStyles.separator}>-</span>
      <input
        type="text"
        value={part2}
        onChange={(e) => handleChange(e, setPart2, 4, part3Ref)}
        onKeyDown={(e) => handleKeyDown(e, part2, part1Ref)}
        maxLength={4}
        placeholder="0000"
        ref={part2Ref}
        style={phoneInputStyles.part}
        required={required}
        title="휴대폰 번호를 입력해주세요."
      />
      <span style={phoneInputStyles.separator}>-</span>
      <input
        type="text"
        value={part3}
        onChange={(e) => handleChange(e, setPart3, 4)}
        onKeyDown={(e) => handleKeyDown(e, part3, part2Ref)}
        maxLength={4}
        placeholder="0000"
        ref={part3Ref}
        style={phoneInputStyles.part}
        required={required}
        title="휴대폰 번호를 입력해주세요."
      />
    </div>
  );
};

const FindAccount = () => {
  const [activeTab, setActiveTab] = useState('findId'); // 'findId' 또는 'resetPw'
  const [findIdForm, setFindIdForm] = useState({
    name: '',
    phone_number: '',
    email: ''
  });
  const [resetPwForm, setResetPwForm] = useState({
    id: '',
    name: '',
    phone_number: '',
    email: ''
  });
  const [findIdResult, setFindIdResult] = useState({
    success: false,
    message: '',
    maskedId: ''
  });
  const [resetPwResult, setResetPwResult] = useState({
    success: false,
    message: '',
    email: '',
    tempPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 입력값 변경 핸들러 - 아이디 찾기
  const handleFindIdChange = (e) => {
    const { name, value } = e.target;
    setFindIdForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  // 입력값 변경 핸들러 - 비밀번호 재설정
  const handleResetPwChange = (e) => {
    const { name, value } = e.target;
    setResetPwForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };

  // 아이디 찾기 제출 핸들러
  const handleFindIdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFindIdResult({
      success: false,
      message: '',
      maskedId: ''
    });

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/find-id', findIdForm);
      
      if (response.data.success) {
        setFindIdResult({
          success: true,
          message: response.data.message,
          maskedId: response.data.masked_id
        });
      } else {
        setFindIdResult({
          success: false,
          message: response.data.message,
          maskedId: ''
        });
      }
    } catch (err) {
      setFindIdResult({
        success: false,
        message: err.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.',
        maskedId: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정 제출 핸들러
  const handleResetPwSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetPwResult({
      success: false,
      message: '',
      email: '',
      tempPassword: ''
    });

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/reset-password', resetPwForm);
      
      if (response.data.success) {
        setResetPwResult({
          success: true,
          message: response.data.message,
          email: response.data.email || '',
          tempPassword: response.data.temp_password || ''
        });
      } else {
        setResetPwResult({
          success: false,
          message: response.data.message,
          email: '',
          tempPassword: ''
        });
      }
    } catch (err) {
      setResetPwResult({
        success: false,
        message: err.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요.',
        email: '',
        tempPassword: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // 로그인 페이지로 이동
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container find-account-container">
      <h2>계정 찾기</h2>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'findId' ? 'active' : ''}`} 
          onClick={() => setActiveTab('findId')}
        >
          아이디 찾기
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resetPw' ? 'active' : ''}`} 
          onClick={() => setActiveTab('resetPw')}
        >
          비밀번호 찾기
        </button>
      </div>

      {activeTab === 'findId' ? (
        <div className="tab-content">
          {!findIdResult.success ? (
            <form onSubmit={handleFindIdSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={findIdForm.name}
                  onChange={handleFindIdChange}
                  required
                  placeholder="가입 시 입력한 이름"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone_number">휴대폰번호</label>
                <PhoneInputField 
                  value={findIdForm.phone_number} 
                  onChange={handleFindIdChange} 
                  name="phone_number" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={findIdForm.email}
                  onChange={handleFindIdChange}
                  required
                  placeholder="가입 시 입력한 이메일"
                />
              </div>
              
              {findIdResult.message && (
                <p className={findIdResult.success ? 'success-message' : 'error-message'}>
                  {findIdResult.message}
                </p>
              )}
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '찾는 중...' : '아이디 찾기'}
              </button>
            </form>
          ) : (
            <div className="result-container">
              <p className="success-message">{findIdResult.message}</p>
              <div className="result-box">
                <p>회원님의 아이디는 <strong>{findIdResult.maskedId}</strong> 입니다.</p>
              </div>
              <div className="button-group">
                <button className="secondary-btn" onClick={() => setActiveTab('resetPw')}>
                  비밀번호 찾기
                </button>
                <button className="primary-btn" onClick={goToLogin}>
                  로그인하기
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="tab-content">
          {!resetPwResult.success ? (
            <form onSubmit={handleResetPwSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="reset-id">아이디</label>
                <input
                  type="text"
                  id="reset-id"
                  name="id"
                  value={resetPwForm.id}
                  onChange={handleResetPwChange}
                  required
                  placeholder="가입한 아이디"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reset-name">이름</label>
                <input
                  type="text"
                  id="reset-name"
                  name="name"
                  value={resetPwForm.name}
                  onChange={handleResetPwChange}
                  required
                  placeholder="가입 시 입력한 이름"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reset-phone">휴대폰번호</label>
                <PhoneInputField 
                  value={resetPwForm.phone_number} 
                  onChange={handleResetPwChange} 
                  name="phone_number" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="reset-email">이메일</label>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  value={resetPwForm.email}
                  onChange={handleResetPwChange}
                  required
                  placeholder="가입 시 입력한 이메일"
                />
              </div>
              
              {resetPwResult.message && (
                <p className={resetPwResult.success ? 'success-message' : 'error-message'}>
                  {resetPwResult.message}
                </p>
              )}
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '처리 중...' : '임시 비밀번호 받기'}
              </button>
            </form>
          ) : (
            <div className="result-container">
              <p className="success-message">{resetPwResult.message}</p>
              <div className="result-box">
                {resetPwResult.tempPassword ? (
                  <p>임시 비밀번호: <strong>{resetPwResult.tempPassword}</strong></p>
                ) : (
                  <p>임시 비밀번호가 <strong>{resetPwResult.email}</strong> 주소로 전송되었습니다.</p>
                )}
                <p className="small-text">로그인 후 비밀번호를 변경해주세요.</p>
              </div>
              <div className="button-group">
                <button className="primary-btn" onClick={goToLogin}>
                  로그인하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindAccount; 