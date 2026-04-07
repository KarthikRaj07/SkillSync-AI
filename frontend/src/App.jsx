import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ResumeInsights from './pages/ResumeInsights';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-analysis" 
              element={
                <ProtectedRoute>
                  <ResumeAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-insights" 
              element={
                <ProtectedRoute>
                  <ResumeInsights />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect "/" to dashboard if logged in, else login */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
