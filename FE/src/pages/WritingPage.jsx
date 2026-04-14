import { useState } from 'react';
import { PenLine, AlertCircle, CheckCircle, TrendingUp, Star } from 'lucide-react';
import api from '../api/axios';

function ScoreCard({ label, score }) {
  const color = score >= 80 ? 'text-green-600 bg-green-50 border-green-200' : score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-red-500 bg-red-50 border-red-200';
  return (
    <div className={`border rounded-2xl p-4 text-center ${color}`}>
      <p className="text-2xl font-bold">{score}</p>
      <p className="text-xs font-semibold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

export default function WritingPage() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [taskType, setTaskType] = useState('essay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please write at least 20 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/ai/writing-feedback', {
        text: text.trim(),
        level,
        taskType,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Writing Feedback</h1>
        <p className="text-gray-500 mt-1 text-sm">Submit your writing and get detailed AI feedback on grammar, vocabulary, and coherence.</p>
      </div>

      {/* Input section */}
      <div className="card mb-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Your Writing</label>
            <span className="text-xs text-gray-400">{text.length} characters</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder="Write your essay, email, story, or any English text here for feedback…"
            rows={6}
            className="input-field resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Type</label>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="input-field">
              <option value="essay">Essay</option>
              <option value="email">Email</option>
              <option value="story">Story</option>
              <option value="description">Description</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4" />
                  Get Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Scores */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Scores</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ScoreCard label="Grammar" score={result.scores.grammar} />
              <ScoreCard label="Vocabulary" score={result.scores.vocabulary} />
              <ScoreCard label="Coherence" score={result.scores.coherence} />
              <ScoreCard label="Overall" score={result.scores.overall} />
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="card border-green-200 bg-green-50">
              <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                Areas to Improve
              </h3>
              <div className="space-y-3">
                {result.improvements.map((item, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-1">{item.issue}</p>
                    <p className="text-sm text-amber-700 mb-2">{item.suggestion}</p>
                    {item.example && (
                      <p className="text-xs font-mono bg-white border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
                        e.g. &ldquo;{item.example}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corrected version */}
          {result.correctedVersion && (
            <div className="card border-blue-200 bg-blue-50">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Corrected Version</h3>
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{result.correctedVersion}</p>
            </div>
          )}

          {/* Encouragement */}
          {result.encouragement && (
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <p className="text-sm leading-relaxed">{result.encouragement}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
