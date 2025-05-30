import React, { useState } from 'react';
import { Tag, Sparkles } from 'lucide-react';

const AITagsSuggest = ({ noteText, fetchGeminiTags }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTagSuggest = async () => {
    setLoading(true);
    setTags([]);
    try {
      const result = await fetchGeminiTags(noteText);
      setTags(result?.tags || []);
    } catch (err) {
      setTags(['AI tagging unavailable']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-2">
      <button
        className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
        onClick={handleTagSuggest}
        disabled={loading || !noteText}
        type="button"
      >
        <Tag size={14} className="mr-1" />
        <Sparkles size={14} className="mr-1" />
        {loading ? 'Suggesting…' : 'Suggest Tags'}
      </button>
      <div className="mt-1 flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span
            key={i}
            className="inline-block bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded text-xs"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AITagsSuggest;
