const aiService = require('../services/ai.service');
const Session   = require('../models/Session');

const handleError = (res, err, label) => {
  console.error(`[AI] ${label}:`, err.message);
  res.status(500).json({ message: 'AI service error', detail: err.message });
};

/**
 * Lưu session sau khi AI trả kết quả — fire & forget.
 * Không làm chậm response, không throw nếu DB lỗi.
 */
const saveSession = (payload) => {
  Session.create(payload).catch((err) =>
    console.error('[Session] Failed to save:', err.message)
  );
};

// ─── Chat ──────────────────────────────────────────────────────
// Chat KHÔNG tự động lưu theo từng message.
// FE tự quyết định khi nào lưu (vd: khi user kết thúc hội thoại)
// bằng cách gọi POST /api/sessions với type = 'chat'.
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'message is required' });

    const reply = await aiService.chat({ message, history });
    res.json({ reply });
  } catch (err) {
    handleError(res, err, 'chat');
  }
};

// ─── Grammar Check ─────────────────────────────────────────────
exports.grammarCheck = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'text is required' });

    const data = await aiService.grammarCheck({ text });
    res.json(data);

    saveSession({
      user:   req.user._id,
      type:   'grammar-check',
      input:  { text },
      result: {
        grammar: {
          corrected:  data.corrected,
          score:      data.score,
          errorCount: data.errors?.length ?? 0,
          feedback:   data.feedback,
        },
      },
      score: data.score,
    });
  } catch (err) {
    handleError(res, err, 'grammarCheck');
  }
};

// ─── Exercise ──────────────────────────────────────────────────
exports.generateExercise = async (req, res) => {
  try {
    const { topic, level, type, count } = req.body;
    if (!topic?.trim()) return res.status(400).json({ message: 'topic is required' });

    const data = await aiService.generateExercise({ topic, level, type, count });

    // Lưu session với đáp án đầy đủ (_exercises ẩn với FE)
    // Phải await để lấy được sessionId trả về FE
    const session = await Session.create({
      user:       req.user._id,
      type:       'exercise',
      input:      { topic, level, type, count },
      _exercises: data.exercises,           // lưu kèm answer để chấm sau
      result: {
        exercise: {
          topic,
          level,
          exerciseType:   type,
          totalQuestions: data.exercises?.length ?? 0,
        },
      },
    });

    // Ẩn đáp án trước khi trả về FE
    const exercisesForClient = data.exercises.map(({ answer, explanation, ...rest }) => rest);

    res.json({
      sessionId:  session._id,             // FE dùng id này để submit sau
      topic:      data.topic,
      level:      data.level,
      type:       data.type,
      exercises:  exercisesForClient,
    });
  } catch (err) {
    handleError(res, err, 'generateExercise');
  }
};

// ─── Vocabulary ────────────────────────────────────────────────
exports.vocabulary = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word?.trim()) return res.status(400).json({ message: 'word is required' });

    const data = await aiService.vocabulary({ word });
    res.json(data);

    saveSession({
      user:  req.user._id,
      type:  'vocabulary',
      input: { word },
      result: {
        vocabulary: {
          word:          data.word,
          pronunciation: data.pronunciation,
          meaning:       data.meaning,
        },
      },
      // vocabulary không có score
    });
  } catch (err) {
    handleError(res, err, 'vocabulary');
  }
};

// ─── Writing Feedback ──────────────────────────────────────────
exports.writingFeedback = async (req, res) => {
  try {
    const { text, level, taskType } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'text is required' });

    const data = await aiService.writingFeedback({ text, level, taskType });
    res.json(data);

    saveSession({
      user:  req.user._id,
      type:  'writing-feedback',
      input: { text, level, taskType },
      result: {
        writing: {
          taskType,
          scores: data.scores,
        },
      },
      score: data.scores?.overall ?? null,
    });
  } catch (err) {
    handleError(res, err, 'writingFeedback');
  }
};
