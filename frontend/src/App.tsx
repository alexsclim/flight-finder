import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { AlertsPage } from './pages/AlertsPage';
import { AlertDetailPage } from './pages/AlertDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ✈️ Awards
            </Link>

            <div className="flex gap-6 items-center">
              <Link to="/search" className="text-gray-700 hover:text-blue-600">
                Search
              </Link>
              {isAuthenticated && (
                <Link to="/alerts" className="text-gray-700 hover:text-blue-600">
                  Alerts
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/alerts"
            element={isAuthenticated ? <AlertsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/alerts/:alertId"
            element={isAuthenticated ? <AlertDetailPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
