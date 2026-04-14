const { getModel } = require('../config/gemini');

// ─── Helper ────────────────────────────────────────────────────
const askJSON = async (prompt) => {
  const model  = getModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
  return JSON.parse(result.response.text());
};

// ─── Chat ──────────────────────────────────────────────────────
exports.chat = async ({ message, history = [] }) => {
  const model = getModel();
  const chat  = model.startChat({
    history: history.map(({ role, parts }) => ({ role, parts: [{ text: parts }] })),
    systemInstruction: {
      parts: [{ text: 'You are a friendly and encouraging English tutor. Help users learn English effectively.' }],
    },
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
};

// ─── Grammar Check ─────────────────────────────────────────────
exports.grammarCheck = async ({ text }) => {
  const prompt = `
You are an expert English grammar checker.
Analyze the following text and return a JSON object with this exact structure:
{
  "corrected": "the fully corrected version of the text",
  "score": <number 0-100 representing grammar accuracy>,
  "errors": [
    {
      "original": "the incorrect phrase",
      "corrected": "the correct phrase",
      "explanation": "brief explanation of the grammar rule"
    }
  ],
  "feedback": "one sentence overall feedback for the student"
}

If there are no errors, return an empty errors array and score of 100.

Text to analyze:
"${text.replace(/"/g, '\\"')}"
`;
  return askJSON(prompt);
};

// ─── Exercise Generator ────────────────────────────────────────
const TYPE_INSTRUCTIONS = {
  'multiple-choice':   'Each exercise has a question and 4 options (A/B/C/D). The "answer" field is the correct option letter.',
  'fill-in-the-blank': 'Each exercise has a sentence with a blank (___). The "answer" field is the missing word/phrase.',
  'sentence-reorder':  'Each exercise has shuffled words in "words" array. The "answer" field is the correctly ordered sentence.',
  'error-correction':  'Each exercise has a sentence with one grammar error. The "answer" field is the corrected sentence.',
};

exports.generateExercise = async ({ topic, level = 'intermediate', type = 'multiple-choice', count = 5 }) => {
  const safeCount = Math.min(Math.max(Number(count) || 5, 1), 10);
  const instruction = TYPE_INSTRUCTIONS[type] ?? TYPE_INSTRUCTIONS['multiple-choice'];

  const prompt = `
You are a creative English teacher creating ${safeCount} ${type} exercises about "${topic}" for ${level} level students.
${instruction}

Return a JSON object with this exact structure:
{
  "topic": "${topic}",
  "level": "${level}",
  "type": "${type}",
  "exercises": [
    {
      "id": 1,
      "question": "the question or sentence",
      ${type === 'multiple-choice'   ? '"options": { "A": "...", "B": "...", "C": "...", "D": "..." },' : ''}
      ${type === 'sentence-reorder'  ? '"words": ["word1", "word2", "..."],' : ''}
      "answer": "the correct answer",
      "explanation": "brief explanation of why this is correct"
    }
  ]
}
`;
  return askJSON(prompt);
};

// ─── Vocabulary ────────────────────────────────────────────────
exports.vocabulary = async ({ word }) => {
  const prompt = `
You are an English dictionary. Look up the word "${word}" and return a JSON object with this exact structure:
{
  "word": "${word}",
  "pronunciation": "IPA pronunciation e.g. /wɜːrd/",
  "meaning": "clear and simple definition of the word",
  "examples": [
    "natural example sentence 1",
    "natural example sentence 2",
    "natural example sentence 3",
    "natural example sentence 4",
    "natural example sentence 5"
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4", "synonym5"]
}
`;
  return askJSON(prompt);
};

// ─── Writing Feedback ──────────────────────────────────────────
exports.writingFeedback = async ({ text, level = 'intermediate', taskType = 'essay' }) => {
  const prompt = `
You are a professional English writing coach.
Evaluate the following ${taskType} written by a ${level} level student and return a JSON object:
{
  "scores": {
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "coherence": <0-100>,
    "overall": <0-100>
  },
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": [
    {
      "issue": "what needs improvement",
      "suggestion": "how to fix it",
      "example": "a better way to write it"
    }
  ],
  "correctedVersion": "the full text rewritten with all corrections applied",
  "encouragement": "a short encouraging message personalized for this student"
}

Student's writing:
"""
${text}
"""
`;
  return askJSON(prompt);
};
