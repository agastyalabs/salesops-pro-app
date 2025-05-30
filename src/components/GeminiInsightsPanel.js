import React from "react";
const GeminiInsightsPanel = () => (
  <div className="bg-blue-50 dark:bg-blue-900 p-5 rounded-xl shadow flex flex-col">
    <h3 className="font-semibold text-blue-700 dark:text-blue-200 mb-2">AI Insights</h3>
    <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mb-2">Get AI Insights</button>
    <span className="text-xs text-gray-700 dark:text-gray-300">AI is temporarily unavailable.</span>
  </div>
);
export default GeminiInsightsPanel;
