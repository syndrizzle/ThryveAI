import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
