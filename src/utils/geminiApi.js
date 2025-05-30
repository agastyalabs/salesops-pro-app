const GEMINI_API_KEY = "AIzaSyCAi6TzDee9lGQZ8RL8Qk2o_Uk0q9k6UYk";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Helper to call Gemini API
async function callGemini(prompt, systemInstruction = "") {
  const requestBody = {
    contents: [
      ...(systemInstruction
        ? [{ role: "system", parts: [{ text: systemInstruction }] }]
        : []),
      { role: "user", parts: [{ text: prompt }] },
    ],
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Gemini API error: " + response.status);
  }
  const data = await response.json();
  // Extract the AI's text from the response:
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Dashboard AI Insights
export async function fetchGeminiAIInsights(userContext) {
  const prompt = `
You are a sales operations assistant. Based on this user's stats, leads, and recent activities, give 2-3 actionable insights or recommendations for their sales pipeline, deals, and contacts. Be concise, specific, and use bullet points if possible.

User context (JSON): ${JSON.stringify(userContext)}
`;
  const text = await callGemini(prompt);
  return { insights: text };
}

// AI Smart Search (natural language)
export async function fetchGeminiSearch(query) {
  const prompt = `
You are a CRM assistant. The user asks: "${query}"
Interpret the intent and return a summarized, actionable response using the user's CRM data. If you can't answer, say so.
`;
  const text = await callGemini(prompt);
  return { answer: text };
}

// AI Activity Summary
export async function fetchGeminiSummary(userContext) {
  const prompt = `
Summarize this user's recent sales activity (calls, meetings, tasks, deals closed, etc) in a short paragraph. Suggest a next focus area.

User context (JSON): ${JSON.stringify(userContext)}
`;
  const text = await callGemini(prompt);
  return { summary: text };
}

// AI Draft Email for Lead/Contact
export async function fetchGeminiDraftEmail(leadOrContact) {
  const prompt = `
Draft a polite, concise, and personalized follow-up sales email to this person. The email should reference recent activity and encourage next steps, without being pushy.

Person details (JSON): ${JSON.stringify(leadOrContact)}
`;
  const text = await callGemini(prompt);
  return { email: text };
}

// AI Tag Suggestion for Note
export async function fetchGeminiTags(noteText) {
  const prompt = `
Suggest 2 to 4 relevant tags for the following CRM note. Return only a comma-separated list of tags.

Note: ${noteText}
`;
  const text = await callGemini(prompt);
  // Parse comma-separated tags into array
  const tags = text.split(",").map((t) => t.trim()).filter(Boolean);
  return { tags };
}
