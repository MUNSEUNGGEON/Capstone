import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../../services/productService';
import MenuBar from '../../common/MenuBar';
import './ProductsPage.css';

const allergyMap = {
  1: "난류", 2: "소고기", 3: "돼지고기", 4: "닭고기",
  5: "새우", 6: "게", 7: "오징어", 8: "고등어", 9: "조개류",
  10: "우유", 11: "땅콩", 12: "호두", 13: "잣", 14: "대두",
  15: "복숭아", 16: "토마토", 17: "밀", 18: "메밀", 19: "아황산류"
};

const ProductsPage = ({ userInfo }) => {
  const [products, setProducts] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [allergiesLoaded, setAllergiesLoaded] = useState(false);
  const [checkedAllergies, setCheckedAllergies] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 사용자 알러지 정보 불러오기
  useEffect(() => {
    const fetchUserAllergies = async () => {
      if (userInfo && userInfo.User_id) {
        try {
          const res = await productService.getUserAllergies(userInfo.User_id);
          let ids = [];
          if (typeof res === 'string') {
            ids = res ? res.split(',').map(a => parseInt(a)) : [];
          } else if (Array.isArray(res)) {
            if (typeof res[0] === 'number') {
              ids = res;
            } else if (res[0]?.Allerg_id !== undefined) {
              ids = res.map(obj => obj.Allerg_id);
            }
          }
          setAllergies(ids);
          setCheckedAllergies(ids);
          setAllergiesLoaded(true);  // ✅ 여기!
        } catch (err) {
          console.error('알레르기 불러오기 실패:', err);
          setAllergies([]);
          setCheckedAllergies([]);
          setAllergiesLoaded(true);  // ✅ 실패했어도 true로
        }
      } else {
        setAllergies([]);
        setCheckedAllergies([]);
        setAllergiesLoaded(true);  // ✅ 로그인 안 되어있어도 true
      }
    };

    fetchUserAllergies();
  }, [userInfo]);

  // 알러지 체크박스 변경 시마다 상품 다시 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      if (!allergiesLoaded) return; // ✅ 알러지 로딩 전에는 실행 안 함
      console.log('checkedAllergies가 변경됨:', checkedAllergies);
      try {
        let res;
        if (userInfo && userInfo.User_id) {
          res = await productService.getAllProducts(userInfo.User_id, checkedAllergies);
        } else {
          res = await productService.getAllProducts(null, checkedAllergies);
        }
        setProducts(res);

        const cats = Array.from(new Set(res.map(p => p.category).filter(c => c)));
        setCategories(cats);
      } catch (err) {
        console.error('상품 불러오기 실패:', err);
      }
    };

    fetchProducts();
  }, [userInfo, checkedAllergies, allergiesLoaded]); // ✅ 여기에도 추가 // userInfo나 체크된 알러지가 바뀔 때마다 재호출

  const toggleAllergy = (id) => {
    setCheckedAllergies(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(x => x !== id);
      } else {
        updated = [...prev, id];
      }
      console.log('현재 체크된 알러지 ID 배열:', updated);
      return updated;
    });
  };

  // 필터링은 서버에서 하기 때문에 클라이언트에서는 검색어, 카테고리만 필터링
  const filtered = products.filter(product => {
    const title = (product.food_products || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedProducts = filtered.slice(startIdx, startIdx + itemsPerPage);

  const pageGroup = Math.floor((currentPage - 1) / 10);
  const groupStart = pageGroup * 10 + 1;

  const goToPage = (page) => setCurrentPage(page);
  const goNextGroup = () => {
    const next = groupStart + 10;
    if (next <= totalPages) setCurrentPage(next);
  };
  const goPrevGroup = () => {
    const prev = groupStart - 10;
    if (prev >= 1) setCurrentPage(prev);
  };

  return (
    <>
      <MenuBar />
      <div className="products-container">
        <aside className="products-sidebar">
          <h3>내 알레르기</h3>
          {!userInfo ? (
            <p>로그인이 필요합니다.</p>
          ) : (
            <ul className="allergy-list">
              {Object.entries(allergyMap).map(([idStr, name]) => {
                const id = parseInt(idStr);
                const isChecked = checkedAllergies.includes(id);
                return (
                  <li key={id} className="allergy-item">
                    <label className="allergy-label">
                      <input
                        type="checkbox"
                        className="allergy-checkbox"
                        checked={isChecked}
                        onChange={() => toggleAllergy(id)}
                      />
                      <span className={`allergy-name ${isChecked ? 'checked' : ''}`}>
                        {name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="products-main">
          <div className="products-header">
            <h1 className="products-title">전체 상품</h1>

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="상품명 검색"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (setSearchTerm(searchInput), setCurrentPage(1))}
              />
              <button
                className="search-button"
                onClick={() => (setSearchTerm(searchInput), setCurrentPage(1))}
              >
                검색
              </button>
            </div>

            <div className="category-filters">
              <button 
                className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => (setSelectedCategory('all'), setCurrentPage(1))}
              >
                전체보기
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => (setSelectedCategory(cat), setCurrentPage(1))}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {pagedProducts.length === 0 && (
              <div className="no-results">검색 결과가 없습니다.</div>
            )}
            {pagedProducts.map(product => (
              <Link 
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="product-card"
              >
                <img 
                  src={product.img || '/placeholder-image.jpg'} 
                  alt={product.food_products}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="product-info">
                  <h3 className="product-name">{product.food_products}</h3>
                  <div className="product-price">
                    {product.price ? `${parseInt(product.price).toLocaleString()}원` : '가격 문의'}
                  </div>
                  {product.category && (
                    <span className="product-category">{product.category}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {pageGroup > 0 && (
                <button className="pagination-button" onClick={goPrevGroup}>
                  이전
                </button>
              )}
              
              {Array.from({ length: Math.min(10, totalPages - groupStart + 1) }, (_, i) => {
                const page = groupStart + i;
                return (
                  <button
                    key={page}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              
              {groupStart + 9 < totalPages && (
                <button className="pagination-button" onClick={goNextGroup}>
                  다음
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default ProductsPage;
