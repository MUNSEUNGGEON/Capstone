"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/auth/Login"
import Register from "./components/auth/register/Register"
import FindAccount from "./components/auth/FindAccount"
import Home from "./components/home/Home"
import DietPlan from "./components/meal/DietPlan"
import FoodDiary from "./components/diet/FoodDiary"
import Navbar from "./components/common/Navbar"
import Growth from "./components/auth/growth/Growth"
import GrowthChart from "./components/auth/growth/GrowthChart"
import Products from "./components/auth/products/ProductsPage"
import ProductsDetail from "./components/auth/products/ProductsDetail"
import RecipeList from "./components/auth/recipe/RecipeList"
import RecipeDetail from "./components/auth/recipe/RecipeDetail"
import MyPage from "./components/user/MyPage"
import CartPage from "./components/cart/CartPage"
import CheckoutPage from "./components/cart/CheckoutPage"
import OrdersPage from "./components/cart/OrdersPage"
import OrderDetailPage from "./components/cart/OrderDetailPage"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  // 브라우저 로드 시 로그인 상태 확인
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo")
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userInfo")
    setIsLoggedIn(false)
    setUserInfo(null)
  }

  return (
    <Router>
      <div className="app">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} userInfo={userInfo} />
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to="/diet-plan" /> : <Home isLoggedIn={isLoggedIn} userInfo={userInfo} />}
            />
            <Route path="/diet-plan" element={isLoggedIn ? <DietPlan /> : <Navigate to="/login" />} />
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/diet-plan" />
                ) : (
                  <Login setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isLoggedIn ? (
                  <Navigate to="/diet-plan" />
                ) : (
                  <Register setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />
                )
              }
            />
            <Route path="/find-account" element={isLoggedIn ? <Navigate to="/diet-plan" /> : <FindAccount />} />
            <Route path="/growth" element={<Growth isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/growth-chart" element={<GrowthChart isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/products" element={<Products isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/products/:id" element={<ProductsDetail isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/recipes" element={<RecipeList isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/recipes/:foodId" element={<RecipeDetail isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route path="/food-diary" element={<FoodDiary isLoggedIn={isLoggedIn} userInfo={userInfo} />} />
            <Route
              path="/mypage"
              element={isLoggedIn ? <MyPage userInfo={userInfo} setUserInfo={setUserInfo} /> : <Navigate to="/login" />}
            />
            <Route path="/cart" element={isLoggedIn ? <CartPage /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={isLoggedIn ? <CheckoutPage userInfo={userInfo} /> : <Navigate to="/login" />} />
            <Route path="/orders" element={isLoggedIn ? <OrdersPage /> : <Navigate to="/login" />} />
            <Route path="/orders/:id" element={isLoggedIn ? <OrderDetailPage /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
