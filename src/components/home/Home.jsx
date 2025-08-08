import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ isLoggedIn, userInfo }) => {
  return (
    <div className="home-container">
      <div className="welcome-section">
        {isLoggedIn ? (
          <div className="user-welcome">
            <h1>{userInfo.name}님, 환영합니다!</h1>
            <div className="user-info">
              <p>아이디: {userInfo.id}</p>
              <p>이메일: {userInfo.email || '등록되지 않음'}</p>
            </div>
          </div>
        ) : (
          <div className="guest-welcome">
            <h1>환영합니다!</h1>
            <p>서비스를 이용하시려면 로그인해주세요.</p>
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">로그인</Link>
              <Link to="/register" className="auth-button register">회원가입</Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>주요 기능</h2>
        <div className="features">
          <div className="feature">
            <h3>식단표</h3>
            <p>① 개인의 알레르기 반영한 식단표 추천</p>
          </div>
          <div className="feature">
            <h3>레시피/제품 검색</h3>
            <p>① 각 메뉴 레시피 및 제품 검색
            <br />
            ② 인기 검색어 확인 및 검색</p>
          </div>
          <div className="feature">
            <h3>성장일지</h3>
            <p>① 아이의 키, 몸무게 기록 및 또래 평균 비교
            <br />
            ② 성장률 높은 아이의 식단일지 열람
            </p>
          </div>
          <div className="feature">
            <h3>식단일지</h3>
            <p>① 식단의 메뉴 별점 부여, 이전 식단 메뉴 열람
            <br />
            ② 식단 영양소 방사형 그래프로 시각화
            </p>
          </div>
          <div className="feature">
            <h3>장바구니/주문</h3>
            <p>① 제품 담기 및 결제</p>
          </div>
          <div className="feature">
            <h3>마이페이지</h3>
            <p>① 회원 정보 및 알레르기 정보 수정
            <br />
            ② 구매 내역 열람
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 