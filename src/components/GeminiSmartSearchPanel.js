import React from 'react';
const GeminiSmartSearchPanel = () => (
  <div className="bg-indigo-50 p-4 rounded mb-4">
    <h3 className="font-bold mb-2">AI Smart Search</h3>
    <input className="border px-2 py-1 mr-2" placeholder="Ask AI..." />
    <button className="bg-indigo-600 text-white px-4 py-2 rounded">Ask AI</button>
    <p className="text-sm text-gray-600 mt-2">AI search temporarily unavailable.</p>
  </div>
);
export default GeminiSmartSearchPanel;
