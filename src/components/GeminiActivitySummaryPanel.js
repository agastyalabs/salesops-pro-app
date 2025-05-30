import React from "react";
const GeminiActivitySummaryPanel = () => (
  <div className="bg-purple-50 dark:bg-purple-900 p-5 rounded-xl shadow flex flex-col">
    <h3 className="font-semibold text-purple-700 dark:text-purple-200 mb-2">AI Activity Summary</h3>
    <button className="bg-purple-600 text-white px-4 py-2 rounded font-semibold mb-2">Summarize My Activity</button>
    <span className="text-xs text-gray-700 dark:text-gray-300">AI summary temporarily unavailable.</span>
  </div>
);
export default GeminiActivitySummaryPanel;
