import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

const AISmartSearch = ({ fetchGeminiSearch }) => {
  const [query, setQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResult('');
    try {
      const result = await fetchGeminiSearch(query);
      setAiResult(result?.answer || 'No result found.');
    } catch (err) {
      setAiResult('AI search temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-950 rounded-xl shadow-lg">
      <div className="flex items-center mb-2">
        <Sparkles size={22} className="mr-2 text-indigo-500 dark:text-indigo-300" />
        <span className="font-semibold text-lg">AI Smart Search</span>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input
          className="flex-1 px-3 py-2 rounded border dark:bg-gray-900 bg-white"
          placeholder='Ask anything, e.g. "Leads not contacted in 14 days"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading || !query}
        >
          <Search size={18} className="mr-1" />
          {loading ? 'Searching…' : 'Ask AI'}
        </button>
      </form>
      <div className="mt-2 min-h-[40px] text-gray-800 dark:text-gray-100 text-base">
        {aiResult}
      </div>
    </div>
  );
};

export default AISmartSearch;
