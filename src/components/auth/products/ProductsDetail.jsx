import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../../services/productService';
import MenuBar from '../../common/MenuBar';
import './ProductsDetail.css';
import { useCart } from '../../../contexts/CartContext';

const ProductsDetail = ({ userInfo }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    productService.getProductDetail(id)
      .then(res => {
        setProduct(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('상품 정보 가져오기 실패:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="loading-message">상품 정보를 불러오는 중입니다...</div>;
  }

  if (!product) {
    return <div className="loading-message">상품을 찾을 수 없습니다.</div>;
  }

  // 숫자+점 앞에서 분리하는 정규식 (그 앞에 '・'가 있으면 제거)
  const splitByNumberDot = (text) => {
    return text
      .replace(/・(?=\d+\.\s)/g, '') // 숫자+점 앞의 ・만 제거
      .split(/(?=\d+\.\s)/g)         // 숫자+점 앞에서 분리
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // 1) ・ 기준으로 먼저 쪼개고
  // 2) 각 항목을 숫자+점 앞에서 쪼갬
  const detailsArray = product.details_info
    ? product.details_info
        .split('・')
        .map(item => item.trim())
        .filter(item => item !== '')
        .flatMap(item => splitByNumberDot(item))
    : [];

  return (
    <>
      <MenuBar />
      <div className="product-detail-container">
        <Link to="/products" className="back-button">
        ← 상품 목록으로 돌아가기
      </Link>

      {/* 대표 이미지와 상품명, 가격 */}
      <div className="product-header">
        {product.img && (
          <img 
            src={product.img} 
            alt={product.food_products} 
            className="product-main-image"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        )}
        <div className="product-main-info">
          <h1 className="product-title">{product.food_products}</h1>
          <div className="product-price">
            {product.price ? `${parseInt(product.price).toLocaleString()}원` : '가격 문의'}
          </div>
          {product.category && (
            <span className="product-category-badge">{product.category}</span>
          )}
          <div className="buy-actions">
            <button
              className="btn-add-cart"
              onClick={() => {
                addItem(product, 1);
                navigate('/cart');
              }}
            >
              장바구니
            </button>
            <button
              className="btn-buy-now"
              onClick={() => {
                addItem(product, 1);
                navigate('/checkout');
              }}
            >
              바로구매
            </button>
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="product-description">
        <h3 className="description-title">상품 설명</h3>
        <div className="description-content">
          {detailsArray.length === 0 ? (
            <p>설명이 없습니다.</p>
          ) : (
            <>
              {/* 첫 문단 */}
              <div className="description-paragraph">{detailsArray[0]}</div>

              {/* 나머지는 리스트로 */}
              {detailsArray.length > 1 && (
                <ul className="description-list">
                  {detailsArray.slice(1).map((item, idx) => (
                    <li key={idx} className="description-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {/* 상세 이미지들 */}
      <div className="product-images-section">
        <h3 className="images-title">상세 이미지</h3>
        <div className="product-images-grid">
          {product.images && product.images.length > 0 ? (
            product.images.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt={`상세 이미지 ${idx + 1}`} 
                className="product-detail-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ))
          ) : (
            <div className="no-images-message">상세 이미지가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 사용자 정보 */}
      {userInfo && (
        <div className="user-info-section">
          <p className="user-info-text">🧑 사용자: {userInfo.name}</p>
        </div>
      )}
    </div>
    </>
  );
};

export default ProductsDetail; 