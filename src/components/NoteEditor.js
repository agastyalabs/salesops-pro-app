import React, { useState } from 'react';
import AITagsSuggest from './AITagsSuggest';
import { fetchGeminiTags } from '../utils/geminiApi';

const NoteEditor = ({ onSave }) => {
  const [note, setNote] = useState('');
  return (
    <div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border rounded p-2"
        rows={4}
        placeholder="Type your note here..."
      />
      <AITagsSuggest
        noteText={note}
        fetchGeminiTags={fetchGeminiTags}
      />
      <button
        onClick={() => onSave(note)}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Note
      </button>
    </div>
  );
};
export default NoteEditor;
