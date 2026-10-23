import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AnalyzePage from './pages/AnalyzePage';
import IntelligencePage from './pages/IntelligencePage';
import RoadmapPage from './pages/RoadmapPage';
import AssessmentPage from './pages/AssessmentPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import TpoDashboard from './pages/tpo/TpoDashboard';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />
          
          {/* Protected Routes wrapped in Layout with Sidebar & Topbar */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/assessments" element={<AssessmentPage />} />
            <Route path="/interview-prep" element={<InterviewPrepPage />} />
            <Route path="/tpo" element={<TpoDashboard />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
