import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import GrammarPage from './pages/GrammarPage';
import ExercisePage from './pages/ExercisePage';
import VocabularyPage from './pages/VocabularyPage';
import WritingPage from './pages/WritingPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} />
      <Route path="/grammar" element={<PrivateRoute><Layout><GrammarPage /></Layout></PrivateRoute>} />
      <Route path="/exercise" element={<PrivateRoute><Layout><ExercisePage /></Layout></PrivateRoute>} />
      <Route path="/vocabulary" element={<PrivateRoute><Layout><VocabularyPage /></Layout></PrivateRoute>} />
      <Route path="/writing" element={<PrivateRoute><Layout><WritingPage /></Layout></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><Layout><HistoryPage /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
