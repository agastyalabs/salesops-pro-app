import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';

const AISummaryWidget = ({ userContext, fetchGeminiSummary }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary('');
    try {
      const result = await fetchGeminiSummary(userContext);
      setSummary(result?.summary || 'No summary available.');
    } catch (err) {
      setSummary('AI summary temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950 rounded-xl shadow-lg">
      <div className="flex items-center mb-2">
        <FileText size={22} className="mr-2 text-purple-500 dark:text-purple-300" />
        <span className="font-semibold text-lg">AI Activity Summary</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
        Summarize your recent week’s sales activities and next steps.
      </p>
      <button
        onClick={handleSummarize}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
        disabled={loading}
      >
        {loading ? 'Summarizing…' : 'Summarize My Activity'}
      </button>
      <div className="mt-4 min-h-[40px] text-gray-800 dark:text-gray-100 text-base">
        {summary}
      </div>
    </div>
  );
};

export default AISummaryWidget;
