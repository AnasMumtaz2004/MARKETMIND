import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PAGE 1: Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* PAGE 2: Research Results */}
        <Route path="/results/:id" element={<Results />} />
        <Route path="/results" element={<Results />} />
        <Route path="/research/:id" element={<Results />} />

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
