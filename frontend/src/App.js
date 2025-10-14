import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppWithNotifications } from './context/AppWithNotifications';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Clients from './pages/Clients';
import VehicleDetails from './pages/VehicleDetails';
import ServiceDetails from './pages/ServiceDetails';
import ClientHistory from './pages/ClientHistory';
import Activities from './pages/Activities';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppWithNotifications>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Dashboard /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activities"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Activities /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Notifications /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Vehicles /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><VehicleDetails /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Services /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><ServiceDetails /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><Clients /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients/:id/history"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary><Layout><ClientHistory /></Layout></ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AppWithNotifications>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;