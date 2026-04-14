import { Link } from 'react-router-dom';
import {
  GraduationCap,
  MessageCircle,
  CheckCircle,
  BookOpen,
  BookMarked,
  PenLine,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Chat with AI Tutor',
    description: 'Have natural conversations with your personal AI English tutor, available 24/7 to answer all your questions.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: CheckCircle,
    title: 'Grammar Check',
    description: 'Instantly identify and correct grammar mistakes with detailed explanations to help you learn from errors.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: BookOpen,
    title: 'Practice Exercises',
    description: 'Sharpen your skills with customized exercises across multiple topics, levels, and formats.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BookMarked,
    title: 'Vocabulary Builder',
    description: 'Look up any word and get pronunciation, meanings, examples, and synonyms to expand your vocabulary.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: PenLine,
    title: 'Writing Feedback',
    description: 'Submit your writing and receive detailed feedback on grammar, vocabulary, coherence, and overall quality.',
    color: 'bg-pink-50 text-pink-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Trainer English</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm py-2 px-4"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 py-24 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Powered by Advanced AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI Trainer English
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Master English with the power of AI — your personal tutor, grammar checker, and writing coach all in one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold py-3.5 px-8 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to learn English
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Five powerful AI-driven tools to accelerate your English learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Join thousands of learners improving their English every day.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 btn-primary text-base py-3 px-8"
          >
            Start Learning for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            AI Trainer English
          </div>
          <p>© {new Date().getFullYear()} AI Trainer English. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
