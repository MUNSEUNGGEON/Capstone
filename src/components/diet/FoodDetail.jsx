import React, { useState, useEffect } from 'react';
import { getFoodDetail } from '../../services/foodService';
import './FoodDetail.css';

const FoodDetail = ({ foodId, onClose }) => {
  const [foodDetail, setFoodDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFoodDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!foodId) {
          setError('음식 ID가 제공되지 않았습니다.');
          setLoading(false);
          return;
        }
        
        const response = await getFoodDetail(foodId);
        
        if (response.success) {
          setFoodDetail(response);
        } else {
          setError(response.message || '음식 정보를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        setError('서버에 연결할 수 없거나 데이터를 가져오는데 실패했습니다.');
        console.error('음식 상세 정보 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoodDetail();
  }, [foodId]);
  
  // 재료 목록 형식화
  const formatMaterials = (materialsStr) => {
    if (!materialsStr) return [];
    
    return materialsStr.split(',').map(item => item.trim());
  };
  
  // 조리 단계 형식화
  const formatCookingSteps = (cookingMethod) => {
    if (!cookingMethod) return [];
    
    // \n으로 단계를 구분하거나, 순서대로 번호 매기기
    return cookingMethod.split('\n').filter(step => step.trim() !== '');
  };
  
  // 텍스트에서 URL 추출
  const extractImageUrl = (url) => {
    if (!url) return '';
    
    // 만약 URL이 http로 시작하지 않으면 기본 경로 추가
    if (!url.startsWith('http')) {
      return `http:${url}`;
    }
    return url;
  };
  
  return (
    <div className="food-detail-container">
      <div className="food-detail-header">
        <h2 className="food-detail-title">
          {loading ? '로딩 중...' : foodDetail?.food?.Food_name || '음식 정보 없음'}
        </h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {loading ? (
        <div className="loading-message">음식 정보를 불러오는 중...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : foodDetail ? (
        <div className="food-detail-content">
          {/* 왼쪽: 재료와 레시피 */}
          <div className="food-info-section">
            <div className="food-image">
              {foodDetail.food.Food_img && (
                <img 
                  src={extractImageUrl(foodDetail.food.Food_img)} 
                  alt={foodDetail.food.Food_name}
                  className="food-detail-img"
                />
              )}
            </div>
            
            <div className="food-materials">
              <h3>재료</h3>
              <ul className="materials-list">
                {formatMaterials(foodDetail.food.Food_materials).map((material, idx) => (
                  <li key={idx}>{material}</li>
                ))}
              </ul>
            </div>
            
            <div className="food-recipe">
              <h3>조리 방법</h3>
              {foodDetail.cooking && foodDetail.cooking.Food_cooking_method ? (
                <ol className="cooking-steps">
                  {formatCookingSteps(foodDetail.cooking.Food_cooking_method).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="no-recipe">레시피 정보가 없습니다.</p>
              )}
            </div>
          </div>
          
          {/* 오른쪽: 관련 상품 */}
          <div className="related-products-section">
            <h3>관련 상품</h3>
            {foodDetail.related_products && foodDetail.related_products.length > 0 ? (
              <div className="products-grid">
                {foodDetail.related_products.map((product, idx) => (
                  <div key={idx} className="product-card">
                    {product.img && (
                      <img 
                        src={extractImageUrl(product.img)} 
                        alt={product.food_products}
                        className="product-img"
                      />
                    )}
                    <div className="product-info">
                      <div className="product-name">{product.food_products}</div>
                      <div className="product-category">{product.category}</div>
                      <div className="product-price">{Number(product.price).toLocaleString()} 원</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-products">관련 상품이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="no-data-message">음식 정보가 없습니다.</div>
      )}
    </div>
  );
};

export default FoodDetail; 
