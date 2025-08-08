import React from 'react';
import MenuBar from '../common/MenuBar';
import FoodDetail from '../diet/FoodDetail';
import './DietPlan.css';

const DietPlanView = ({
  currentDate, viewType, handleViewTypeChange, generating, error,
  weekdays, days, prevMonth, nextMonth, formatMonth, expandedDate, isSameDate, isCurrentMonth, isWeekend,
  handleDateClick, hasMealData, meals, formatDateString, selectedMenuItem, handleMenuItemClick, handleFoodClick,
  formatDate, selectedDate, formatSelectedDate, loading, selectedMeal, showFoodDetail, selectedFoodId, handleCloseFoodDetail,
  handleRefreshMeal,
  showGenerateOptions, handleShowGenerateOptions, handleGenerateByType
}) => (
  <div className="diet-plan-container">
    <MenuBar />
    <div className="diet-plan-header">
      <h1>식단표</h1>
      <div className="diet-type-selector">
        <span className="diet-type-label">식단표 단위:</span>
        <label className={`diet-type-option ${viewType === '일' ? 'active' : ''}`}>
          <input type="radio" name="viewType" value="일" checked={viewType === '일'} onChange={() => handleViewTypeChange('일')} />일
        </label>
        <label className={`diet-type-option ${viewType === '주' ? 'active' : ''}`}>
          <input type="radio" name="viewType" value="주" checked={viewType === '주'} onChange={() => handleViewTypeChange('주')} />주
        </label>
        <label className={`diet-type-option ${viewType === '월' ? 'active' : ''}`}>
          <input type="radio" name="viewType" value="월" checked={viewType === '월'} onChange={() => handleViewTypeChange('월')} />월
        </label>
      </div>
      <div style={{ position: 'relative' }}>
        <button className="diet-create-btn" onClick={handleShowGenerateOptions} disabled={generating}>
          {generating ? '식단 생성 중...' : '식단 생성'}
        </button>
        {showGenerateOptions && (
          <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8, zIndex: 10, padding: 10, display: 'flex', gap: 8 }}>
            <button className="diet-create-btn" style={{ background: '#4caf50' }} onClick={() => handleGenerateByType('하루')}>하루</button>
            <button className="diet-create-btn" style={{ background: '#ff9800' }} onClick={() => handleGenerateByType('일주일')}>일주일</button>
            <button className="diet-create-btn" style={{ background: '#4285f4' }} onClick={() => handleGenerateByType('한달')}>한달</button>
          </div>
        )}
      </div>
    </div>
    {error && <div className="error-message">{error}</div>}
    <div className="calendar-container">
      <div className="calendar-nav">
        <button onClick={prevMonth} className="nav-btn">«</button>
        <button onClick={prevMonth} className="nav-btn">‹</button>
        <span className="current-month">{formatMonth(currentDate)}</span>
        <button onClick={nextMonth} className="nav-btn">›</button>
        <button onClick={nextMonth} className="nav-btn">»</button>
      </div>
      <table className="calendar">
        <thead>
          <tr>
            {weekdays.map((day, index) => (
              <th key={index} className={index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <tr>
                {week.map((day, dayIndex) => {
                  const isExpanded = expandedDate && isSameDate(day, expandedDate);
                  return (
                    <td
                      key={dayIndex}
                      className={`calendar-cell ${!isCurrentMonth(day) ? 'other-month' : ''} ${isWeekend(day) && isCurrentMonth(day) ? (day.getDay() === 0 ? 'sunday' : 'saturday') : ''} ${isExpanded ? 'expanded' : ''} ${selectedDate && isSameDate(day, selectedDate) ? 'selected-date' : ''}`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="calendar-date">{formatDate(day)}</div>
                      {hasMealData(day) && isCurrentMonth(day) && (
                        <div className={`diet-summary ${isExpanded ? 'expanded-summary' : ''}`}>
                          {meals[formatDateString(day)]?.rice_name && (
                            <div
                              className={`diet-item rice ${isExpanded && selectedMenuItem === 'rice' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'rice');
                                  handleFoodClick(meals[formatDateString(day)].Rice_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].rice_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'rice');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                          {meals[formatDateString(day)]?.soup_name && (
                            <div
                              className={`diet-item soup ${isExpanded && selectedMenuItem === 'soup' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'soup');
                                  handleFoodClick(meals[formatDateString(day)].Soup_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].soup_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'soup');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                          {meals[formatDateString(day)]?.main_dish_name && (
                            <div
                              className={`diet-item main-dish ${isExpanded && selectedMenuItem === 'main_dish' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'main_dish');
                                  handleFoodClick(meals[formatDateString(day)].MainDish_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].main_dish_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'main_dish');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                          {meals[formatDateString(day)]?.side_dish1_name && (
                            <div
                              className={`diet-item side-dish ${isExpanded && selectedMenuItem === 'side_dish1' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'side_dish1');
                                  handleFoodClick(meals[formatDateString(day)].SideDish1_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].side_dish1_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'side_dish1');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                          {meals[formatDateString(day)]?.side_dish2_name && (
                            <div
                              className={`diet-item side-dish2 ${isExpanded && selectedMenuItem === 'side_dish2' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'side_dish2');
                                  handleFoodClick(meals[formatDateString(day)].SideDish2_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].side_dish2_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'side_dish2');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                          {meals[formatDateString(day)]?.dessert_name && (
                            <div
                              className={`diet-item dessert ${isExpanded && selectedMenuItem === 'dessert' ? 'selected-menu-item' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  handleMenuItemClick(e, 'dessert');
                                  handleFoodClick(meals[formatDateString(day)].Dessert_id);
                                }
                              }}
                            >
                              <span className="diet-item-name">{meals[formatDateString(day)].dessert_name}</span>
                              {isExpanded && (
                                <button
                                  className="refresh-meal-btn"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRefreshMeal(day, 'dessert');
                                  }}
                                  disabled={loading}
                                >
                                  🔄
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
    <div className="selected-date-info">
      <div className="selected-date-label">
        선택된 날짜: {formatSelectedDate(selectedDate)}
        {selectedMenuItem && expandedDate && (
          <span className="selected-menu-label"> - 선택된 메뉴: {
            selectedMenuItem === 'rice' ? '밥' :
            selectedMenuItem === 'soup' ? '국/찌개' :
            selectedMenuItem === 'main_dish' ? '메인요리' :
            selectedMenuItem === 'side_dish1' ? '반찬1' :
            selectedMenuItem === 'side_dish2' ? '반찬2' :
            selectedMenuItem === 'dessert' ? '디저트' : ''
          }</span>
        )}
      </div>
      {loading ? (
        <div className="loading-message">식단 정보를 불러오는 중...</div>
      ) : selectedMeal ? (
        <div className="selected-date-diet">
          {selectedMeal.rice_id && (
            <div className="meal-block">
              <h3 className="meal-title">밥</h3>
              <ul className="meal-items">
                <li>
                  <span onClick={() => handleFoodClick(selectedMeal.rice_id)} className="food-item-clickable">{selectedMeal.rice_name}</span>
                  <button
                    className="refresh-meal-btn"
                    onClick={() => handleRefreshMeal(selectedDate, 'rice')}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </li>
              </ul>
            </div>
          )}
          {selectedMeal.soup_id && (
            <div className="meal-block">
              <h3 className="meal-title">국/찌개</h3>
              <ul className="meal-items">
                <li>
                  <span onClick={() => handleFoodClick(selectedMeal.soup_id)} className="food-item-clickable">{selectedMeal.soup_name}</span>
                  <button
                    className="refresh-meal-btn"
                    onClick={() => handleRefreshMeal(selectedDate, 'soup')}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </li>
              </ul>
            </div>
          )}
          {(selectedMeal.side_dish1_id || selectedMeal.side_dish2_id) && (
            <div className="meal-block">
              <h3 className="meal-title">반찬</h3>
              <ul className="meal-items">
                {selectedMeal.side_dish1_id && (
                  <li>
                    <span onClick={() => handleFoodClick(selectedMeal.side_dish1_id)} className="food-item-clickable">{selectedMeal.side_dish1_name}</span>
                    <button
                      className="refresh-meal-btn"
                      onClick={() => handleRefreshMeal(selectedDate, 'side_dish1')}
                      disabled={loading}
                    >
                      🔄
                    </button>
                  </li>
                )}
                {selectedMeal.side_dish2_id && (
                  <li>
                    <span onClick={() => handleFoodClick(selectedMeal.side_dish2_id)} className="food-item-clickable">{selectedMeal.side_dish2_name}</span>
                    <button
                      className="refresh-meal-btn"
                      onClick={() => handleRefreshMeal(selectedDate, 'side_dish2')}
                      disabled={loading}
                    >
                      🔄
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
          {selectedMeal.main_dish_id && (
            <div className="meal-block">
              <h3 className="meal-title">메인요리</h3>
              <ul className="meal-items">
                <li>
                  <span onClick={() => handleFoodClick(selectedMeal.main_dish_id)} className="food-item-clickable">{selectedMeal.main_dish_name}</span>
                  <button
                    className="refresh-meal-btn"
                    onClick={() => handleRefreshMeal(selectedDate, 'main_dish')}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </li>
              </ul>
            </div>
          )}
          {selectedMeal.dessert_id && (
            <div className="meal-block">
              <h3 className="meal-title">디저트</h3>
              <ul className="meal-items">
                <li>
                  <span onClick={() => handleFoodClick(selectedMeal.dessert_id)} className="food-item-clickable">{selectedMeal.dessert_name}</span>
                  <button
                    className="refresh-meal-btn"
                    onClick={() => handleRefreshMeal(selectedDate, 'dessert')}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        null
      )}
    </div>
    {showFoodDetail && selectedFoodId && (
      <div className="food-detail-modal">
        <FoodDetail foodId={selectedFoodId} onClose={handleCloseFoodDetail} />
      </div>
    )}
  </div>
);

export default DietPlanView;
