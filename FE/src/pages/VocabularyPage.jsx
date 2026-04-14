import { useState, useEffect } from 'react';
import { Search, Volume2, VolumeX, BookMarked, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useTTS } from '../hooks/useTTS';

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-28" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
      </div>
      <div className="h-16 bg-gray-100 rounded-xl" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full" />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function VocabularyPage() {
  const { speak, stop, speaking } = useTTS();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordData, setWordData] = useState(null);
  const [recentWords, setRecentWords] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    api.get('/sessions', { params: { type: 'vocabulary', limit: 10 } })
      .then(({ data }) => setRecentWords(data.sessions || []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [wordData]);

  const searchWord = async (word) => {
    const w = word || query;
    if (!w.trim()) return;
    setLoading(true);
    setError('');
    setWordData(null);
    try {
      const { data } = await api.post('/ai/vocabulary', { word: w.trim() });
      setWordData(data);
      setQuery(w.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Word not found. Please try another word.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchWord();
  };

  const handleSynonymClick = (synonym) => {
    setQuery(synonym);
    searchWord(synonym);
  };

  const toggleSpeak = (text, opts) => {
    if (speaking) stop();
    else speak(text, opts);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vocabulary Builder</h1>
        <p className="text-gray-500 mt-1 text-sm">Look up any English word for pronunciation, meaning, examples, and synonyms.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Search for a word (e.g. perseverance)…"
              className="input-field pl-12 pr-32 text-base py-3"
            />
            <button
              onClick={() => searchWord()}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && <SkeletonCard />}

          {/* Word card */}
          {!loading && wordData && (
            <div className="card space-y-5">
              {/* Word header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{wordData.word}</h2>
                  {wordData.pronunciation && (
                    <p className="text-gray-500 text-sm mt-1 font-mono">{wordData.pronunciation}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleSpeak(wordData.word)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                    speaking
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100'
                  }`}
                  title={speaking ? 'Stop' : 'Listen to pronunciation'}
                >
                  {speaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Meaning */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Meaning</p>
                <p className="text-gray-800 text-sm leading-relaxed">{wordData.meaning}</p>
              </div>

              {/* Examples */}
              {wordData.examples?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Examples</p>
                  <ol className="space-y-2">
                    {wordData.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm text-gray-700 leading-relaxed italic">&ldquo;{ex}&rdquo;</p>
                        <button
                          onClick={() => speak(ex, { rate: 0.8 })}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Synonyms */}
              {wordData.synonyms?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Synonyms</p>
                  <div className="flex flex-wrap gap-2">
                    {wordData.synonyms.map((syn) => (
                      <button
                        key={syn}
                        onClick={() => handleSynonymClick(syn)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm font-medium transition-all duration-150"
                      >
                        {syn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !wordData && !error && (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-gray-600 font-medium">Search for a word to get started</p>
              <p className="text-gray-400 text-sm mt-1">Enter any English word in the search bar above.</p>
            </div>
          )}
        </div>

        {/* Recent words sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Lookups</h3>
            {loadingRecent ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentWords.length > 0 ? (
              <div className="space-y-1">
                {recentWords.map((s) => {
                  const word = s.input?.word || s.result?.vocabulary?.word || '—';
                  return (
                    <button
                      key={s._id}
                      onClick={() => { setQuery(word); searchWord(word); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150"
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No recent lookups yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
