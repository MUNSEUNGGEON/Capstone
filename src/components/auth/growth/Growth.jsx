import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { growthService } from '../../../services/growthService';
import MenuBar from '../../common/MenuBar';
import './GrowthChart.css';

const Growth = ({ userInfo, isLoggedIn }) => {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (userInfo?.User_id || userInfo?.user_id) {
      loadRecentRecords();
    }
  }, [userInfo, isLoggedIn, navigate]);

  const loadRecentRecords = async () => {
    try {
      const userId = userInfo?.User_id || userInfo?.user_id;
      const response = await growthService.getGrowthData(userId);
      if (response.growth_data) {
        setRecentRecords(response.growth_data.slice(0, 5)); // 최근 5개만 표시
      }
    } catch (error) {
      console.error('최근 기록 로드 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!height || !weight || !date) {
      alert('모든 필드를 채워 주세요!');
      return;
    }
    const userId = userInfo?.User_id || userInfo?.user_id;
    if (!userId) {
      alert('로그인이 필요합니다!');
      return;
    }

    setLoading(true);
    try {
      await growthService.saveGrowthData({
        child_id: userId,
        height,
        weight,
        record_date: date,
      });
      alert('성장 데이터가 저장되었습니다!');
      setHeight('');
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
      loadRecentRecords(); // 기록 새로고침
    } catch (err) {
      console.error(err);
      alert('저장 중 오류 발생!');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="growth-container">
      <MenuBar />
      
      <div className="growth-header">
        <h1>성장 기록 입력</h1>
        <button 
          className="chart-btn"
          onClick={() => navigate('/growth-chart')}
        >
          성장 차트 보기
        </button>
      </div>

      <div className="growth-content">
        <div className="growth-form-section">
          <h2>새 기록 추가</h2>
          <form onSubmit={handleSubmit} className="growth-form">
            <div className="form-group">
              <label htmlFor="date">날짜</label>
              <input 
                id="date"
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="height">키 (cm)</label>
              <input 
                id="height"
                type="number" 
                placeholder="키를 입력하세요" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                required 
                min="0"
                max="300"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">몸무게 (kg)</label>
              <input 
                id="weight"
                type="number" 
                placeholder="몸무게를 입력하세요" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                required 
                min="0"
                max="200"
                step="0.1"
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '저장 중...' : '기록 저장'}
            </button>
          </form>
        </div>

        <div className="recent-records-section">
          <h2>최근 기록</h2>
          {recentRecords.length > 0 ? (
            <div className="records-list">
              {recentRecords.map((record, index) => (
                <div key={index} className="record-item">
                  <div className="record-date">{record.record_date}</div>
                  <div className="record-data">
                    <span>키: {record.height_cm}cm</span>
                    <span>몸무게: {record.weight_kg}kg</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-records">
              아직 기록된 성장 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Growth; 