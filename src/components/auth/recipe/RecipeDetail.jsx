import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeService } from '../../../services/recipeService';
import MenuBar from '../../common/MenuBar';
import './RecipeDetail.css';

function RecipeDetail() {
  const { foodId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      recipeService.getRecipeDetail(foodId),
      recipeService.getRecipeCooking(foodId)
    ])
    .then(([recipeRes, cookingRes]) => {
      setRecipe(recipeRes);
      
      const newSteps = [];
      cookingRes.forEach(item => {
        const methods = item.Food_cooking_method
          ? item.Food_cooking_method.trim().split('\n').map(line => line.trim()).filter(Boolean)
          : [];

        const images = item.Food_cooking_image
          ? item.Food_cooking_image.trim().split(/\s+/)
          : [];

        methods.forEach((method, idx) => {
          newSteps.push({
            method,
            image: images[idx] || null
          });
        });
      });
      
      setSteps(newSteps);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [foodId]);

  if (loading) {
    return <div className="loading-message">레시피 정보를 불러오는 중입니다...</div>;
  }

  if (!recipe) {
    return <div className="loading-message">레시피를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      <MenuBar />
      <div className="recipe-detail-container">
        <Link to="/recipes" className="back-button">
        ← 레시피 목록으로 돌아가기
      </Link>

      {/* 상단: 이미지 + 이름 + 재료 */}
      <div className="recipe-header">
        <img
          src={recipe.Food_img || '/placeholder-recipe.jpg'}
          alt={recipe.Food_name}
          className="recipe-main-image"
          onError={(e) => {
            e.target.src = '/placeholder-recipe.jpg';
          }}
        />
        <div className="recipe-info">
          <h1 className="recipe-title">{recipe.Food_name}</h1>
          
          {recipe.Food_role && (
            <span className="recipe-role-badge">{recipe.Food_role}</span>
          )}
          
          <div className="ingredients-section">
            <h4 className="ingredients-title">재료</h4>
            <div className="ingredients-text">
              {recipe.Food_materials || '재료 정보가 없습니다.'}
            </div>
          </div>
        </div>
      </div>

      {/* 조리법과 이미지 */}
      <div className="cooking-steps-section">
        <h3 className="cooking-steps-title">조리 과정</h3>
        
        {steps.length === 0 ? (
          <div className="no-steps-message">
            조리법 정보가 없습니다.
          </div>
        ) : (
          steps.map((step, idx) => (
            <div key={idx} className="cooking-step">
              <div className="step-content">
                <div className="step-number">{idx + 1}</div>
                <p className="step-text">{step.method}</p>
              </div>
              {step.image && (
                <img
                  src={step.image}
                  alt={`조리 과정 ${idx + 1}`}
                  className="step-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-recipe.jpg';
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}

export default RecipeDetail; 