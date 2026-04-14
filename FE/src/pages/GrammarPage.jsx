import { useState } from 'react';
import { CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import api from '../api/axios';

function ScoreBadge({ score }) {
  const color = score >= 80 ? 'bg-green-100 text-green-700 border-green-200' : score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200';
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Fair' : 'Needs Work';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${color}`}>
      {label}
    </span>
  );
}

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <div className="flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
    </div>
  );
}

export default function GrammarPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/ai/grammar-check', { text: text.trim() });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check grammar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grammar Check</h1>
        <p className="text-gray-500 mt-1 text-sm">Paste your text and get instant grammar feedback with corrections.</p>
      </div>

      {/* Input */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Text</label>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          placeholder="Type or paste your text here... (e.g. She don't like go to school yesterday.)"
          rows={5}
          className="input-field resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{text.length} characters</span>
          <button
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            className="btn-primary"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Check Grammar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score row */}
          <div className="card flex flex-col sm:flex-row items-center gap-6">
            <ScoreCircle score={result.score} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                <h2 className="text-xl font-bold text-gray-900">Grammar Score</h2>
                <ScoreBadge score={result.score} />
              </div>
              <p className="text-gray-500 text-sm">
                {result.errors.length === 0
                  ? 'No errors found — excellent writing!'
                  : `${result.errors.length} error${result.errors.length > 1 ? 's' : ''} found and corrected.`}
              </p>
            </div>
          </div>

          {/* Corrected text */}
          <div className="card border-green-200 bg-green-50">
            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Corrected Text
            </h3>
            <p className="text-green-900 text-sm leading-relaxed">{result.corrected}</p>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Corrections Breakdown</h3>
              <div className="space-y-3">
                {result.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-red-600 line-through">{err.original}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-600">{err.corrected}</span>
                      </div>
                      <p className="text-xs text-gray-500">{err.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall feedback */}
          <div className="card border-blue-200 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Overall Feedback
            </h3>
            <p className="text-blue-900 text-sm leading-relaxed">{result.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
