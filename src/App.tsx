import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { SplineBackground } from './components/SplineBackground';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Form from './pages/Form';
import CallProgress from './pages/CallProgress';
import CallResults from './pages/CallResults';
import Error from './pages/Error';
import Profile from './pages/Profile';
import { supabase } from './lib/supabase';

function AuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      }
    });
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SplineBackground>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/error" element={<Error />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Form />
              </ProtectedRoute>
            } />
            <Route path="/call-progress" element={
              <ProtectedRoute>
                <CallProgress />
              </ProtectedRoute>
            } />
            <Route path="/call-results" element={
              <ProtectedRoute>
                <CallResults />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SplineBackground>
      </AuthProvider>
    </Router>
  );
}

export default App;
