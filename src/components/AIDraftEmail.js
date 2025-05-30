import React, { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';

const AIDraftEmail = ({ leadOrContact, fetchGeminiDraftEmail }) => {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDraft = async () => {
    setLoading(true);
    setDraft('');
    try {
      const result = await fetchGeminiDraftEmail(leadOrContact);
      setDraft(result?.email || 'No draft generated.');
    } catch (err) {
      setDraft('AI drafting temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-950 rounded-xl shadow">
      <div className="flex items-center mb-1">
        <Mail size={18} className="mr-2 text-pink-500 dark:text-pink-300" />
        <span className="font-semibold text-base">AI Draft Email</span>
        <Sparkles size={16} className="ml-2 text-pink-400 dark:text-pink-200" />
      </div>
      <button
        className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded shadow text-sm"
        disabled={loading}
        onClick={handleDraft}
      >
        {loading ? 'Drafting…' : 'Draft Follow-up Email'}
      </button>
      <div className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-100 text-sm">
        {draft}
      </div>
    </div>
  );
};

export default AIDraftEmail;
