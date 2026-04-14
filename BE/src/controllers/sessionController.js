const Session = require('../models/Session');

// ─── Tạo session mới ───────────────────────────────────────────
/**
 * POST /api/sessions
 * Dùng cho chat — các loại khác BE tự lưu sau khi AI trả kết quả.
 */
exports.createSession = async (req, res) => {
  try {
    const { type, input, result, score, duration } = req.body;

    const session = await Session.create({
      user: req.user._id,
      type,
      input,
      result,
      score,
      duration,
    });

    res.status(201).json({ session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─── Nộp bài exercise ─────────────────────────────────────────
/**
 * POST /api/sessions/:id/submit
 * Body: { answers: { "1": "A", "2": "B", ... }, duration: number }
 *
 * BE tự chấm điểm bằng cách so sánh với đáp án đã lưu trong _exercises.
 * FE chỉ gửi đáp án user chọn, không tự tính điểm.
 */
exports.submitExercise = async (req, res) => {
  try {
    const { answers, duration = 0 } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'answers is required' });
    }

    // Lấy session kèm _exercises (select: false nên phải ghi rõ)
    const session = await Session.findOne({
      _id:  req.params.id,
      user: req.user._id,
      type: 'exercise',
    }).select('+_exercises');

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.score !== null) return res.status(400).json({ message: 'Exercise already submitted' });

    // Chấm điểm
    const exercises      = session._exercises ?? [];
    let   correctAnswers = 0;

    const results = exercises.map((ex) => {
      const userAnswer    = answers[ex.id]?.toString().trim().toLowerCase();
      const correctAnswer = ex.answer?.toString().trim().toLowerCase();
      const isCorrect     = userAnswer === correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        id:          ex.id,
        userAnswer:  answers[ex.id],
        answer:      ex.answer,       // tiết lộ đáp án đúng sau khi nộp
        explanation: ex.explanation,
        isCorrect,
      };
    });

    const score = exercises.length > 0
      ? Math.round((correctAnswers / exercises.length) * 100)
      : 0;

    // Cập nhật session
    session.score                          = score;
    session.duration                       = duration;
    session.result.exercise.correctAnswers = correctAnswers;
    session.result.exercise.score          = score;
    session.result.exercise.userAnswers    = answers;
    await session.save();

    res.json({ score, correctAnswers, total: exercises.length, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Lịch sử học tập ──────────────────────────────────────────
/**
 * GET /api/sessions?type=&page=&limit=
 * Lấy danh sách sessions của user hiện tại, phân trang.
 */
exports.getHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select('-__v'),
      Session.countDocuments(filter),
    ]);

    res.json({
      sessions,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Thống kê tiến độ ─────────────────────────────────────────
/**
 * GET /api/sessions/stats
 * Tổng quan tiến độ học tập của user.
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [activityBreakdown, avgScores, recentSessions] = await Promise.all([
      // Số lượng theo từng loại activity
      Session.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$type', count: { $sum: 1 }, totalDuration: { $sum: '$duration' } } },
      ]),

      // Điểm trung bình theo từng loại (chỉ những session có score)
      Session.aggregate([
        { $match: { user: userId, score: { $ne: null } } },
        { $group: { _id: '$type', avgScore: { $avg: '$score' }, sessions: { $sum: 1 } } },
      ]),

      // 5 session gần nhất
      Session.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type score createdAt input'),
    ]);

    // Tổng thời gian học (giây)
    const totalDuration = activityBreakdown.reduce((sum, a) => sum + a.totalDuration, 0);
    const totalSessions = activityBreakdown.reduce((sum, a) => sum + a.count, 0);

    res.json({
      totalSessions,
      totalDuration,
      activityBreakdown: activityBreakdown.reduce((acc, cur) => {
        acc[cur._id] = { count: cur.count, totalDuration: cur.totalDuration };
        return acc;
      }, {}),
      avgScores: avgScores.reduce((acc, cur) => {
        acc[cur._id] = { avgScore: Math.round(cur.avgScore), sessions: cur.sessions };
        return acc;
      }, {}),
      recentSessions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
