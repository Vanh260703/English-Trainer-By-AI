import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  CheckCircle,
  BookOpen,
  BookMarked,
  PenLine,
  Clock,
  Target,
  TrendingUp,
  Layers,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

const quickAccess = [
  { to: '/chat', icon: MessageCircle, label: 'Chat with AI Tutor', desc: 'Practice conversation', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { to: '/grammar', icon: CheckCircle, label: 'Grammar Check', desc: 'Fix your writing', color: 'bg-green-50 text-green-600 border-green-100' },
  { to: '/exercise', icon: BookOpen, label: 'Practice Exercises', desc: 'Test your knowledge', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { to: '/vocabulary', icon: BookMarked, label: 'Vocabulary Builder', desc: 'Expand your vocabulary', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { to: '/writing', icon: PenLine, label: 'Writing Feedback', desc: 'Improve your writing', color: 'bg-pink-50 text-pink-600 border-pink-100' },
];

function ScoreColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/sessions/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const totalHours = stats ? (stats.totalDuration / 3600).toFixed(1) : '0';
  const avgExerciseScore = stats?.avgScores?.exercise?.avgScore ?? '—';
  const wordsLearned = stats?.activityBreakdown?.vocabulary?.count ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning overview for today.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg mb-2 w-16" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-8 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalSessions ?? 0}</p>
            <p className="text-sm text-gray-500 mt-0.5">Total Sessions</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
            <p className="text-sm text-gray-500 mt-0.5">Hours Learned</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgExerciseScore}</p>
            <p className="text-sm text-gray-500 mt-0.5">Avg Exercise Score</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{wordsLearned}</p>
            <p className="text-sm text-gray-500 mt-0.5">Words Looked Up</p>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickAccess.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col p-4 rounded-2xl border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${color.split(' ').slice(2).join(' ')} bg-white`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color.split(' ').slice(0, 2).join(' ')}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">{desc}</p>
              <span className={`mt-auto text-xs font-medium flex items-center gap-1 ${color.split(' ').slice(0, 2).join(' ')}`}>
                Start <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {loading ? (
          <div className="card space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-16 h-5 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="w-12 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : stats?.recentSessions?.length > 0 ? (
          <div className="card divide-y divide-gray-50">
            {stats.recentSessions.slice(0, 5).map((s) => (
              <div key={s._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`badge ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-600'} flex-shrink-0`}>
                  {TYPE_LABELS[s.type] || s.type}
                </span>
                <p className="text-sm text-gray-700 flex-1 truncate">
                  {s.input?.topic || s.input?.word || s.input?.summary || 'Session'}
                </p>
                {s.score != null && (
                  <span className={`text-sm font-semibold ${ScoreColor(s.score)}`}>
                    {s.score}%
                  </span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {timeAgo(s.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No activity yet</p>
            <p className="text-gray-400 text-sm mt-1">Start a session to see your activity here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
