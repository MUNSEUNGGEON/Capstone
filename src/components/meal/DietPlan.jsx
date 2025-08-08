import React from 'react';
import useDietPlan from '../meal/useDietPlan';
import DietPlanView from '../meal/DietPlanView';
import '../meal/DietPlan.css';

const DietPlan = () => {
  const props = useDietPlan();
  return <DietPlanView {...props} />;
};

export default DietPlan;