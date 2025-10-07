import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWithNotifications } from './context/AppWithNotifications';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Clients from './pages/Clients';
import VehicleDetails from './pages/VehicleDetails';
import ServiceDetails from './pages/ServiceDetails';
import ClientHistory from './pages/ClientHistory';
import Activities from './pages/Activities';
import Notifications from './pages/Notifications';

function App() {
  return (
    <SettingsProvider>
      <AppWithNotifications>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/" element={<ErrorBoundary><Layout><Dashboard /></Layout></ErrorBoundary>} />
            <Route path="/dashboard" element={<ErrorBoundary><Layout><Dashboard /></Layout></ErrorBoundary>} />
            <Route path="/activities" element={<ErrorBoundary><Layout><Activities /></Layout></ErrorBoundary>} />
            <Route path="/notifications" element={<ErrorBoundary><Layout><Notifications /></Layout></ErrorBoundary>} />
            <Route path="/vehicles" element={<ErrorBoundary><Layout><Vehicles /></Layout></ErrorBoundary>} />
            <Route path="/vehicles/:id" element={<ErrorBoundary><Layout><VehicleDetails /></Layout></ErrorBoundary>} />
            <Route path="/services" element={<ErrorBoundary><Layout><Services /></Layout></ErrorBoundary>} />
            <Route path="/services/:id" element={<ErrorBoundary><Layout><ServiceDetails /></Layout></ErrorBoundary>} />
            <Route path="/clients" element={<ErrorBoundary><Layout><Clients /></Layout></ErrorBoundary>} />
            <Route path="/clients/:id/history" element={<ErrorBoundary><Layout><ClientHistory /></Layout></ErrorBoundary>} />
            </Routes>
          </div>
        </Router>
      </AppWithNotifications>
    </SettingsProvider>
  );
}

export default App;