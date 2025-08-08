import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import MenuBar from '../../common/MenuBar';
import './GrowthChart.css';

const GrowthChart = ({ isLoggedIn, userInfo }) => {
  const navigate = useNavigate();
  const [growthData, setGrowthData] = useState([]);
  const [peerData, setPeerData] = useState([]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleLines, setVisibleLines] = useState({
    height: true,
    weight: true,
    avg_height: true,
    avg_weight: true
  });
  const [prediction, setPrediction] = useState({ height: null, weight: null });
  const [topGrowthList, setTopGrowthList] = useState([]); // 🚀 추가: 상위 랭킹 데이터

  const userId = userInfo?.User_id || userInfo?.user_id || localStorage.getItem('user_id');

  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인 후 데이터를 조회할 수 있습니다.');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    console.log('GrowthChart - userInfo:', userInfo);
    console.log('GrowthChart - userId:', userId);
    console.log('GrowthChart - localStorage userInfo:', localStorage.getItem('userInfo'));
    
    if (userId) {
      fetchData();
      fetchTopGrowth(); // 🚀 추가
    } else {
      console.error('User ID가 없어서 데이터를 가져올 수 없습니다.');
      console.error('userInfo:', userInfo);
      console.error('localStorage userInfo:', localStorage.getItem('userInfo'));
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;

    const defaultStartDate = '2000-01-01';
    const defaultEndDate = '2100-01-01';
    const fetchStartDate = startDate || defaultStartDate;
    const fetchEndDate = endDate || defaultEndDate;

    try {
      let url = `http://localhost:5000/api/get_growth_peer_data?user_id=${userId}&start_date=${fetchStartDate}&end_date=${fetchEndDate}`;
      const res = await axios.get(url);
      const formattedGrowthData = res.data.growth_data.map(item => ({
        date: item.record_date,
        height: item.height_cm,
        weight: item.weight_kg,
      }));
      const formattedPeerData = (res.data.peer_data || [])
        .filter(item => item.avg_height !== null && item.avg_weight !== null)
        .map(item => ({
          date: item.date,
          avg_height: item.avg_height,
          avg_weight: item.avg_weight,
        }));

      setGrowthData(formattedGrowthData);
      setPeerData(formattedPeerData);
      calculatePrediction(formattedGrowthData);
    } catch (error) {
      console.error('데이터를 불러오는 데 실패했습니다:', error);
      alert('데이터를 불러오는 데 실패했습니다.');
    }
  };

  // 🚀 추가: 최근 30일 키 성장 상위 랭킹 조회
  const fetchTopGrowth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/top_growth_children');
      console.log('Top growth API 응답:', res.data);
      setTopGrowthList(res.data);
    } catch (error) {
      console.error('상위 성장 랭킹 데이터를 불러오지 못했습니다:', error);
    }
  };


  const calculatePrediction = (data) => {
    if (data.length < 2) {
      setPrediction({ height: null, weight: null });
      return;
    }
    const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const last = sorted[sorted.length - 1];
    const secondLast = sorted[sorted.length - 2];
    const heightDiff = last.height - secondLast.height;
    const weightDiff = last.weight - secondLast.weight;
    const predictedHeight = last.height + heightDiff;
    const predictedWeight = last.weight + weightDiff;
    setPrediction({
      height: predictedHeight.toFixed(1),
      weight: predictedWeight.toFixed(1),
    });
  };

  const combinedData = growthData.map(item => {
    const peerItem = peerData.find(p => p.date === item.date) || {};
    return {
      date: item.date,
      height: item.height,
      weight: item.weight,
      avg_height: peerItem.avg_height || null,
      avg_weight: peerItem.avg_weight || null,
    };
  });

  const submitGrowth = async () => {
    if (!userId || !height || !weight) {
      alert('모든 값을 입력해 주세요.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/height_weight', {
        child_id: userId,
        height,
        weight,
      });
      alert('성장 기록이 저장되었습니다.');
      fetchData();
      fetchTopGrowth(); // 🚀 다시 불러오기
      setHeight('');
      setWeight('');
    } catch (error) {
      console.error('성장 기록 저장 실패:', error);
      alert('성장 기록 저장에 실패했습니다.');
    }
  };

  const handleCheckboxChange = (key) => {
    setVisibleLines(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="growth-chart-container">
      <MenuBar />
      
      <button 
        className="back-button"
        onClick={() => navigate('/growth')}
        style={{ marginBottom: '20px' }}
      >
        ← 성장 기록으로 돌아가기
      </button>
      
      <h2>성장 그래프</h2>

      <div className="input-form">
        <input
          type="number"
          placeholder="키 (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="몸무게 (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button onClick={submitGrowth}>기록 저장</button>
      </div>

      <div className="date-filter">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchData}>조회</button>
      </div>

      <div className="checkbox-container">
        <label><input type="checkbox" checked={visibleLines.height} onChange={() => handleCheckboxChange('height')} /> 내 키</label>
        <label><input type="checkbox" checked={visibleLines.weight} onChange={() => handleCheckboxChange('weight')} /> 내 몸무게</label>
        <label><input type="checkbox" checked={visibleLines.avg_height} onChange={() => handleCheckboxChange('avg_height')} /> 또래 키 평균</label>
        <label><input type="checkbox" checked={visibleLines.avg_weight} onChange={() => handleCheckboxChange('avg_weight')} /> 또래 몸무게 평균</label>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            yAxisId="left"
            label={{ value: '키 (cm)', angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: '몸무게 (kg)', angle: 90, position: 'insideRight' }}
            domain={['auto', 'auto']}
          />
          <Tooltip />
          <Legend />
          {visibleLines.height && <Line yAxisId="left" type="monotone" dataKey="height" name="내 키" stroke="#8884d8" />}
          {visibleLines.weight && <Line yAxisId="right" type="monotone" dataKey="weight" name="내 몸무게" stroke="#82ca9d" />}
          {visibleLines.avg_height && <Line yAxisId="left" type="monotone" dataKey="avg_height" name="또래 키 평균" stroke="#ff7300" />}
          {visibleLines.avg_weight && <Line yAxisId="right" type="monotone" dataKey="avg_weight" name="또래 몸무게 평균" stroke="#00c49f" />}
        </LineChart>
      </ResponsiveContainer>

      {prediction.height && prediction.weight && (
        <div className="prediction-text">
          다음 달 키는 <strong>{prediction.height} cm</strong>, 몸무게는 <strong>{prediction.weight} kg</strong>으로 예상돼요!
        </div>
      )}

      {topGrowthList.length > 0 && (
        <div className="top-growth-ranking">
          <h3>최근 한 달간 키가 많이 자란 아이</h3>
          <ol>
            {topGrowthList.map((child, index) => (
              <li key={index}>
                <strong>ID {child.child_id}</strong> - 키 성장: <strong>{child.height_growth} cm</strong>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GrowthChart; 