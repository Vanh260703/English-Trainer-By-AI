import { useState, useEffect, useCallback } from 'react';
import { History, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const TABS = [
  { label: 'All',       value: '' },
  { label: 'Grammar',   value: 'grammar-check' },
  { label: 'Exercise',  value: 'exercise' },
  { label: 'Vocabulary',value: 'vocabulary' },
  { label: 'Writing',   value: 'writing-feedback' },
  { label: 'Chat',      value: 'chat' },
];

const TYPE_COLORS = {
  exercise: 'bg-purple-100 text-purple-700',
  vocabulary: 'bg-yellow-100 text-yellow-700',
  'grammar-check': 'bg-green-100 text-green-700',
  'writing-feedback': 'bg-pink-100 text-pink-700',
  chat: 'bg-blue-100 text-blue-700',
};

const TYPE_LABELS = {
  exercise: 'Exercise',
  vocabulary: 'Vocabulary',
  'grammar-check': 'Grammar',
  'writing-feedback': 'Writing',
  chat: 'Chat',
};

function ScoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInputSummary(session) {
  const { type, input } = session;
  if (type === 'vocabulary') return input?.word || '—';
  if (type === 'exercise') return [input?.topic, input?.level].filter(Boolean).join(' · ') || '—';
  if (type === 'grammar-check' || type === 'writing-feedback') {
    const t = input?.text || '';
    return t.length > 60 ? t.slice(0, 60) + '…' : t || '—';
  }
  if (type === 'chat') return input?.summary || 'Chat session';
  return '—';
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [activeType, setActiveType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (activeType) params.type = activeType;
      const { data } = await api.get('/sessions', { params });
      setSessions(data.sessions || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [page, activeType]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const changeTab = (type) => {
    setActiveType(type);
    setPage(1);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Learning History</h1>
        <p className="text-gray-500 mt-1 text-sm">Browse all your past learning sessions.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => changeTab(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeType === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="card space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-100 rounded" />
              <div className="w-10 h-4 bg-gray-100 rounded" />
              <div className="w-16 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <>
          <div className="card divide-y divide-gray-50">
            {sessions.map((s) => (
              <div key={s._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className={`badge flex-shrink-0 ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-600'}`}>
                  {TYPE_LABELS[s.type] || s.type}
                </span>
                <p className="flex-1 text-sm text-gray-700 truncate min-w-0">
                  {getInputSummary(s)}
                </p>
                {s.score != null && (
                  <span className={`text-sm font-semibold flex-shrink-0 ${ScoreColor(s.score)}`}>
                    {s.score}%
                  </span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {timeAgo(s.createdAt)}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-gray-500">
                Showing {sessions.length} of {pagination.total} sessions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost py-2 px-3 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-sm text-gray-600 font-medium px-2">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn-ghost py-2 px-3 text-sm disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No sessions found</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeType
              ? `You haven't done any ${TYPE_LABELS[activeType] || activeType} sessions yet.`
              : "Start learning to see your history here."}
          </p>
        </div>
      )}
    </div>
  );
}
