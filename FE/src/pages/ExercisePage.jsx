import { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckCircle, XCircle, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import api from '../api/axios';

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="56" cy="56" r={radius} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" transform="rotate(-90 56 56)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="56" y="56" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function ExercisePage() {
  const [step, setStep] = useState('setup'); // setup | exercise | result
  const [setup, setSetup] = useState({ topic: '', level: 'intermediate', type: 'multiple-choice', count: '5' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exerciseData, setExerciseData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [reorderSelections, setReorderSelections] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 'exercise') {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleSetupChange = (e) => {
    setSetup((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError('');
  };

  const startExercise = async () => {
    if (!setup.topic.trim()) { setError('Please enter a topic.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/ai/exercise', {
        topic: setup.topic.trim(),
        level: setup.level,
        type: setup.type,
        count: parseInt(setup.count, 10),
      });
      setExerciseData(data);
      setAnswers({});
      setReorderSelections({});
      setElapsed(0);
      setStep('exercise');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (exerciseId, answer) => {
    setAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
  };

  const handleReorderClick = (exerciseId, word) => {
    setReorderSelections((prev) => {
      const current = prev[exerciseId] || [];
      if (current.includes(word)) return { ...prev, [exerciseId]: current.filter((w) => w !== word) };
      return { ...prev, [exerciseId]: [...current, word] };
    });
  };

  const submitExercise = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    setError('');
    const finalAnswers = { ...answers };
    // For reorder, join selected words
    if (exerciseData.type === 'sentence-reorder') {
      for (const ex of exerciseData.exercises) {
        if (reorderSelections[ex.id]) {
          finalAnswers[ex.id] = reorderSelections[ex.id].join(' ');
        }
      }
    }
    try {
      const { data } = await api.post(`/sessions/${exerciseData.sessionId}/submit`, {
        answers: Object.fromEntries(Object.entries(finalAnswers).map(([k, v]) => [String(k), v])),
        duration: elapsed,
      });
      setResult(data);
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('setup');
    setExerciseData(null);
    setResult(null);
    setAnswers({});
    setReorderSelections({});
    setError('');
  };

  if (step === 'setup') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Practice Exercises</h1>
          <p className="text-gray-500 mt-1 text-sm">Generate custom exercises to practice your English.</p>
        </div>
        <div className="card space-y-5">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="topic"
              value={setup.topic}
              onChange={handleSetupChange}
              placeholder="e.g. present perfect tense, vocabulary about travel…"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
              <select name="level" value={setup.level} onChange={handleSetupChange} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select name="type" value={setup.type} onChange={handleSetupChange} className="input-field">
                <option value="multiple-choice">Multiple Choice</option>
                <option value="fill-in-the-blank">Fill in the Blank</option>
                <option value="error-correction">Error Correction</option>
                <option value="sentence-reorder">Sentence Reorder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Questions</label>
              <select name="count" value={setup.count} onChange={handleSetupChange} className="input-field">
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>
          <button
            onClick={startExercise}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate Exercises
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'exercise' && exerciseData) {
    const allAnswered = exerciseData.exercises.every((ex) => {
      if (exerciseData.type === 'sentence-reorder') {
        return reorderSelections[ex.id]?.length > 0;
      }
      return answers[ex.id] !== undefined && answers[ex.id] !== '';
    });

    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Topic: <span className="font-medium text-gray-700">{exerciseData.topic}</span>
              {' · '}
              <span className="capitalize">{exerciseData.level}</span>
              {' · '}
              <span className="capitalize">{exerciseData.type.replace('-', ' ')}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
            <Clock className="w-4 h-4" />
            {formatTimer(elapsed)}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          {exerciseData.exercises.map((ex, idx) => (
            <div key={ex.id} className="card">
              <p className="text-sm font-semibold text-gray-500 mb-2">Question {idx + 1} of {exerciseData.exercises.length}</p>
              <p className="text-base font-medium text-gray-900 mb-4">{ex.question}</p>

              {exerciseData.type === 'multiple-choice' && ex.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OPTION_KEYS.filter((k) => ex.options[k] !== undefined).map((key) => (
                    <button
                      key={key}
                      onClick={() => selectAnswer(ex.id, key)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150 ${
                        answers[ex.id] === key
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                        answers[ex.id] === key
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-500'
                      }`}>{key}</span>
                      {ex.options[key]}
                    </button>
                  ))}
                </div>
              )}

              {exerciseData.type === 'fill-in-the-blank' && (
                <input
                  type="text"
                  placeholder="Type your answer…"
                  value={answers[ex.id] || ''}
                  onChange={(e) => selectAnswer(ex.id, e.target.value)}
                  className="input-field"
                />
              )}

              {exerciseData.type === 'error-correction' && (
                <textarea
                  placeholder="Write the corrected sentence…"
                  value={answers[ex.id] || ''}
                  onChange={(e) => selectAnswer(ex.id, e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                />
              )}

              {exerciseData.type === 'sentence-reorder' && (() => {
                const words = ex.question.replace(/_+/g, '').trim().split(/\s+/).filter(Boolean);
                const shuffled = ex.options
                  ? Object.values(ex.options)
                  : words.sort(() => Math.random() - 0.5);
                const selected = reorderSelections[ex.id] || [];
                return (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Click words in the correct order:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {shuffled.map((word, wi) => {
                        const isSelected = selected.includes(word);
                        return (
                          <button
                            key={wi}
                            onClick={() => handleReorderClick(ex.id, word)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                              isSelected
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'
                            }`}
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>
                    {selected.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-800">
                        <span className="text-xs text-gray-500 block mb-1">Your order:</span>
                        {selected.join(' ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={submitExercise}
            disabled={submitting || !allAnswered}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Answers'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <button onClick={reset} className="btn-outline">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>

        {/* Score */}
        <div className="card flex flex-col sm:flex-row items-center gap-6 mb-6">
          <ScoreCircle score={result.score} />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">
              {result.correctAnswers} / {result.total} Correct
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {result.score >= 80 ? 'Excellent work! Keep it up.' : result.score >= 60 ? 'Good effort! Review the mistakes below.' : 'Keep practicing — you\'ll improve!'}
            </p>
          </div>
        </div>

        {/* Per-question results */}
        <div className="space-y-4">
          {result.results.map((r, idx) => (
            <div key={r.id} className={`card border ${r.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${r.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {r.isCorrect
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <XCircle className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Question {idx + 1}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-1.5">
                    <span>
                      Your answer: <span className={`font-semibold ${r.isCorrect ? 'text-green-700' : 'text-red-600'}`}>{r.userAnswer || '(no answer)'}</span>
                    </span>
                    {!r.isCorrect && (
                      <span>
                        Correct: <span className="font-semibold text-green-700">{r.answer}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{r.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
