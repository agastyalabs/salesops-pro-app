import React, { useState } from 'react';
import AIDraftEmail from '../components/AIDraftEmail';
import { fetchGeminiDraftEmail } from '../utils/geminiApi';

// ...your normal lead detail props...
const LeadDetail = ({ lead, ...props }) => {
  // ...other detail logic...
  return (
    <div>
      {/* ...your usual lead info... */}
      <AIDraftEmail
        leadOrContact={lead}
        fetchGeminiDraftEmail={fetchGeminiDraftEmail}
      />
    </div>
  );
};
export default LeadDetail;
