const mongoose = require('mongoose');

const grammarResultSchema = new mongoose.Schema({
  corrected:  { type: String },
  score:      { type: Number, min: 0, max: 100 },
  errorCount: { type: Number, default: 0 },
  feedback:   { type: String },
}, { _id: false });

const exerciseResultSchema = new mongoose.Schema({
  topic:          { type: String },
  level:          { type: String },
  exerciseType:   { type: String },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  score:          { type: Number, min: 0, max: 100 },
  // Đáp án user chọn: { "1": "A", "2": "C", ... }
  userAnswers:    { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const vocabularyResultSchema = new mongoose.Schema({
  word:          { type: String },
  pronunciation: { type: String },
  meaning:       { type: String },
}, { _id: false });

const writingResultSchema = new mongoose.Schema({
  taskType:   { type: String },
  scores: {
    grammar:    { type: Number },
    vocabulary: { type: Number },
    coherence:  { type: Number },
    overall:    { type: Number },
  },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['chat', 'grammar-check', 'exercise', 'vocabulary', 'writing-feedback'],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      grammar:    { type: grammarResultSchema,    default: undefined },
      exercise:   { type: exerciseResultSchema,   default: undefined },
      vocabulary: { type: vocabularyResultSchema, default: undefined },
      writing:    { type: writingResultSchema,    default: undefined },
    },
    // Lưu full exercises kèm đáp án — ẩn với FE, chỉ dùng nội bộ để chấm điểm
    _exercises: {
      type: [mongoose.Schema.Types.Mixed],
      select: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
