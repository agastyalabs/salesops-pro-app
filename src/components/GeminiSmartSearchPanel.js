import React from "react";
const GeminiSmartSearchPanel = () => (
  <div className="bg-indigo-50 dark:bg-indigo-900 p-5 rounded-xl shadow flex flex-col">
    <h3 className="font-semibold text-indigo-700 dark:text-indigo-200 mb-2">AI Smart Search</h3>
    <div className="flex mb-2">
      <input className="border px-2 py-1 rounded-l w-full" placeholder="Ask AI..." />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-r font-semibold">Ask AI</button>
    </div>
    <span className="text-xs text-gray-700 dark:text-gray-300">AI search temporarily unavailable.</span>
  </div>
);
export default GeminiSmartSearchPanel;
