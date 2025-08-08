import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../../../services/recipeService';
import MenuBar from '../../common/MenuBar';
import './RecipeList.css';

const allergyMap = {
  1: "난류", 2: "소고기", 3: "돼지고기", 4: "닭고기",
  5: "새우", 6: "게", 7: "오징어", 8: "고등어", 9: "조개류",
  10: "우유", 11: "땅콩", 12: "호두", 13: "잣", 14: "대두",
  15: "복숭아", 16: "토마토", 17: "밀", 18: "메밀", 19: "아황산류"
};

const RecipeList = ({ userInfo }) => {
  const [recipes, setRecipes] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [checkedAllergies, setCheckedAllergies] = useState([]);
  const [allergiesLoaded, setAllergiesLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [categories, setCategories] = useState([]);
  const itemsPerPage = 8;
  const [isInitialLoad, setIsInitialLoad] = useState(true); 
  

  // 사용자 알러지 정보 로딩
  useEffect(() => {
    const fetchUserAllergies = async () => {
      if (userInfo?.User_id) {
        try {
          const res = await recipeService.getUserAllergies(userInfo.User_id);
          let ids = [];
          if (typeof res === 'string') {
            ids = res ? res.split(',').map(Number) : [];
          } else if (Array.isArray(res)) {
            ids = res.map(obj => obj.Allerg_id ?? obj);
          }
          setAllergies(ids);
          setCheckedAllergies(ids);

          // 초기 레시피 불러오기
          const recipes = await recipeService.getAllRecipes(userInfo.User_id, ids);
          setRecipes(recipes);

          const uniqueRoles = Array.from(
            new Set(recipes.map(recipe => recipe.Food_role).filter(Boolean))
          );
          setCategories(uniqueRoles);
        } catch (err) {
          console.error('알러지 불러오기 실패:', err);
          setAllergies([]);
          setCheckedAllergies([]);
        } finally {
          setIsInitialLoad(false); // ✅ 초기 로딩 끝
        }
      } else {
        setAllergies([]);
        setCheckedAllergies([]);
        setIsInitialLoad(false);
      }
      setAllergiesLoaded(true);
    };

    fetchUserAllergies();
  }, [userInfo]);

  // ✅ 사용자가 알러지 체크박스를 변경했을 때만 반응
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // 체크된 알러지가 없으면 호출하지 않도록 하거나 빈 문자열 보내도록 조정
        if (checkedAllergies.length === 0) {
          setRecipes([]); // 아예 빈 리스트 보여주거나, 서버에 빈 문자열로 보내 필터 없는 상태로 가져오기
          setCategories([]);
          return;
        }

        const res = await recipeService.getAllRecipes(userInfo?.User_id ?? null, checkedAllergies);
        setRecipes(res);

        const uniqueRoles = Array.from(
          new Set(res.map(recipe => recipe.Food_role).filter(Boolean))
        );
        setCategories(uniqueRoles);
      } catch (err) {
        console.error('레시피 불러오기 실패:', err);
      }
    };

    if (!isInitialLoad && allergiesLoaded) {
      fetchRecipes();
    }
  }, [checkedAllergies, allergiesLoaded]);


  const toggleAllergy = (id) => {
    setCheckedAllergies(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return updated;
    });
    setCurrentPage(1);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const splitSteps = (method) => {
    if (!method) return [];
    return method
      .split('\n')
      .map(line => line.trim().replace(/^\d+\.\s*/, ''))
      .filter(line => line);
  };

  const getShortCooking = (method, maxLines = 2) => {
    if (!method) return '';
    const steps = splitSteps(method);
    return steps.slice(0, maxLines).join(' / ') + (steps.length > maxLines ? '...' : '');
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.Food_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || recipe.Food_role === selectedCategory;

  return matchesSearch && matchesCategory;
});


  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedRecipes = filteredRecipes.slice(startIdx, startIdx + itemsPerPage);

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
      <div className="recipes-container">
        {/* ─── 알레르기 사이드바 ─── */}
      <aside className="recipes-sidebar">
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

      {/* ─── 본문 ─── */}
      <section className="recipes-main">
        <div className="recipes-header">
          <h1 className="recipes-title">레시피 목록</h1>

          {/* 검색 */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="레시피명 검색"
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

          {/* 카테고리 */}
          <div className="category-filters">
            <button
              className={`category-button ${selectedCategory === '전체' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('전체');
                setCurrentPage(1);
              }}
            >
              전체
            </button>

            {categories.map(cat => (
              <button
                key={cat}
                className={`category-button ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 레시피 목록 */}
        <div className="recipes-grid">
          {pagedRecipes.length === 0 && (
            <div className="no-results">검색 결과가 없습니다.</div>
          )}
          
          {pagedRecipes.map(recipe => {
            const isExpanded = expandedId === recipe.Food_id;
            return (
              <div 
                key={recipe.Food_id} 
                className={`recipe-card ${isExpanded ? 'expanded' : ''}`}
              >
                <img 
                  src={recipe.Food_img || '/placeholder-recipe.jpg'} 
                  alt={recipe.Food_name}
                  className="recipe-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-recipe.jpg';
                  }}
                />
                
                <div className="recipe-info">
                  <h3 className="recipe-name">{recipe.Food_name}</h3>
                  
                  {recipe.Food_role && (
                    <span className="recipe-role">{recipe.Food_role}</span>
                  )}
                  
                  <div className="recipe-materials">
                    <strong>재료:</strong> {recipe.Food_materials || '정보 없음'}
                  </div>
                  
                  <div className="recipe-cooking-short">
                    <strong>조리법:</strong> {getShortCooking(recipe.Food_cooking_method) || '조리법 정보 없음'}
                  </div>
                  
                  <div className="recipe-actions">
                    <button 
                      className="expand-button"
                      onClick={() => toggleExpand(recipe.Food_id)}
                    >
                      {isExpanded ? '접기' : '더보기'}
                    </button>
                    
                    <Link 
                      to={`/recipes/${recipe.Food_id}`} 
                      className="detail-link"
                    >
                      상세보기
                    </Link>
                  </div>
                  
                  {isExpanded && (
                    <div className="expanded-cooking">
                      <h4>상세 조리법</h4>
                      <ol className="cooking-steps">
                        {splitSteps(recipe.Food_cooking_method).map((step, idx) => (
                          <li key={idx} className="cooking-step">
                            <span className="step-number">{idx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
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

export default RecipeList; 