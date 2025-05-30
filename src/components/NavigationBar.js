import React from 'react';

const NavigationBar = ({
  onBack,
  goToDashboard,
  showBack = true,
  showDashboard = true,
  backLabel = "← Back",
  dashboardLabel = "🏠 Dashboard",
  className = "",
}) => (
  <div className={`flex gap-3 mb-6 ${className}`}>
    {showBack && (
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        {backLabel}
      </button>
    )}
    {showDashboard && (
      <button
        onClick={goToDashboard}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
      >
        {dashboardLabel}
      </button>
    )}
  </div>
);

export default NavigationBar;
