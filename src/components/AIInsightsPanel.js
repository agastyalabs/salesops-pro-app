import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const AIInsightsPanel = ({ userContext, fetchGeminiAIInsights }) => {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetInsights = async () => {
    setLoading(true);
    setInsights('');
    try {
      // fetchGeminiAIInsights should call your Gemini API endpoint with the relevant user context
      const aiResult = await fetchGeminiAIInsights(userContext);
      setInsights(aiResult?.insights || 'No insights available.');
    } catch (err) {
      setInsights('AI is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 rounded-xl shadow-lg">
      <div className="flex items-center mb-2">
        <Sparkles size={22} className="mr-2 text-blue-500 dark:text-blue-300" />
        <span className="font-semibold text-lg">AI Insights</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
        Get actionable suggestions and smart tips powered by Gemini AI.
      </p>
      <button
        onClick={handleGetInsights}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        disabled={loading}
      >
        {loading ? 'Thinking…' : 'Get AI Insights'}
      </button>
      <div className="mt-4 min-h-[40px] text-gray-800 dark:text-gray-100 text-base">
        {insights}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
