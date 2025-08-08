import { Link } from 'react-router-dom';
import './MenuBar.css';

const MenuBar = () => {
  return (
    <div className="menu-bar">
      <div className="menu-container">
        <Link to="/growth" className="menu-item">
          <div className="menu-icon">📏</div>
          <span className="menu-text">성장 기록</span>
        </Link>
        
        <Link to="/growth-chart" className="menu-item">
          <div className="menu-icon">📊</div>
          <span className="menu-text">성장 차트</span>
        </Link>
        
        <Link to="/products" className="menu-item">
          <div className="menu-icon">🛒</div>
          <span className="menu-text">상품 검색</span>
        </Link>
        
        <Link to="/recipes" className="menu-item">
          <div className="menu-icon">🍳</div>
          <span className="menu-text">레시피</span>
        </Link>
        
        <Link to="/diet-plan" className="menu-item">
          <div className="menu-icon">🍽️</div>
          <span className="menu-text">식단표</span>
        </Link>

        <Link to="/food-diary" className="menu-item">
          <div className="menu-icon">📓</div>
          <span className="menu-text">식단일지</span>
        </Link>
      </div>
    </div>
  );
};

export default MenuBar;