import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = ({ setIsLoggedIn, setUserInfo }) => {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // 로그인 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("로그인 요청 전송:", formData.id);
      const response = await axios.post('http://127.0.0.1:5000/api/login', formData);
      console.log("로그인 응답:", response.data);

      if (response.data.success) {
        // 로그인 성공
        const token = response.data.token;
        console.log("로그인 성공, 토큰:", token ? token.substring(0, 10) + "..." : "토큰 없음");
        
        // 사용자 정보에 토큰 추가
        const userInfoWithToken = {
          ...response.data.user,
          token: token // 토큰을 user 객체에 추가
        };
        
        // 전역 상태 및 localStorage 업데이트
        setIsLoggedIn(true);
        setUserInfo(userInfoWithToken);
        localStorage.setItem('userInfo', JSON.stringify(userInfoWithToken));
        
        // localStorage에 제대로 저장되었는지 확인
        const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        console.log("localStorage에 저장된 userInfo:", savedUserInfo);
        console.log("저장된 토큰:", savedUserInfo.token ? savedUserInfo.token.substring(0, 10) + "..." : "토큰 없음");
        
        navigate('/diet-plan'); // 식단표 페이지로 이동
      } else {
        // 서버는 200 OK를 주더라도 success: false인 경우
        console.log("로그인 실패:", response.data.message);
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      if (err.response) {
        // 서버가 응답을 했지만 에러 (예: 400, 401, 500)
        console.log("서버 응답 오류:", err.response.status, err.response.data);
        setError(err.response.data?.message || '서버 오류가 발생했습니다.');
      } else if (err.request) {
        // 요청은 보냈지만 응답을 못받음
        console.log("서버 응답 없음:", err.request);
        setError('서버에 연결할 수 없습니다.');
      } else {
        // 그 외의 에러
        console.log("기타 오류:", err.message);
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="id">아이디</label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <div className="account-links">
        <Link to="/find-account">아이디/비밀번호 찾기</Link>
      </div>
      
      <p className="auth-link">
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </div>
  );
};

export default Login;
