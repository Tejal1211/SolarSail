import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ErrorBoundary from './components/ErrorBoundary';

// Components (stub for now - to be implemented)
const Dashboard = () => <div className="p-8">Dashboard</div>;
const Login = () => <div className="p-8">Login</div>;
const Signup = () => <div className="p-8">Signup</div>;
const CarbonTracker = () => <div className="p-8">Carbon Tracker</div>;
const Missions = () => <div className="p-8">Missions</div>;
const Leaderboard = () => <div className="p-8">Leaderboard</div>;

/**
 * Protected route component
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

/**
 * Main App Component
 */
export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // App initialization logic
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carbon"
              element={
                <ProtectedRoute>
                  <CarbonTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/missions"
              element={
                <ProtectedRoute>
                  <Missions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
