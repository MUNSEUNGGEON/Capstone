"use client"

import { Link } from "react-router-dom"
import "./Navbar.css"

const Navbar = ({ isLoggedIn, onLogout, userInfo }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          아맞식
        </Link>

        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <span className="user-greeting">{userInfo?.name}님</span>
              <Link to="/mypage" className="nav-link">
                마이페이지
              </Link>
              <button className="logout-btn" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                로그인
              </Link>
              <Link to="/register" className="nav-link register-link">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
