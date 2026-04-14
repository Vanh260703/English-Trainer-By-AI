import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Save, Bot, User, AlertCircle } from 'lucide-react';
import api from '../api/axios';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary-600" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const buildHistory = (msgs) =>
    msgs.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: m.text }));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg = { id: Date.now(), role: 'user', text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    setError('');

    try {
      const history = buildHistory(messages);
      const { data } = await api.post('/ai/chat', { message: text, history });
      const aiMsg = { id: Date.now() + 1, role: 'ai', text: data.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get a response. Please try again.');
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError('');
    setSaved(false);
    startTime.current = Date.now();
  };

  const saveSession = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      await api.post('/sessions', {
        type: 'chat',
        input: { summary: messages.slice(0, 3).map((m) => m.text).join(' | ') },
        duration,
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  const exchangeCount = Math.floor(messages.length / 2);

  return (
    <div className="flex flex-col h-screen max-h-screen p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Chat with AI Tutor</h1>
          <p className="text-xs text-gray-500">Your personal English learning assistant</p>
        </div>
        <div className="flex items-center gap-2">
          {exchangeCount >= 2 && !saved && (
            <button
              onClick={saveSession}
              disabled={saving}
              className="btn-outline text-sm py-2 px-3"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Session'}
            </button>
          )}
          {saved && (
            <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
              Session saved!
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="btn-ghost text-sm py-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {messages.length === 0 && !typing && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Ask your AI tutor anything about English grammar, vocabulary, pronunciation, or practice conversations.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-primary-600' : 'bg-primary-100'
            }`}>
              {msg.role === 'user'
                ? <User className="w-4 h-4 text-white" />
                : <Bot className="w-4 h-4 text-primary-600" />
              }
            </div>
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {typing && <TypingIndicator />}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="btn-primary py-2.5 px-4 flex-shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
