import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWithNotifications } from './context/AppWithNotifications';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout/Layout';
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
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/activities" element={<Layout><Activities /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/vehicles" element={<Layout><Vehicles /></Layout>} />
            <Route path="/vehicles/:id" element={<Layout><VehicleDetails /></Layout>} />
            <Route path="/services" element={<Layout><Services /></Layout>} />
            <Route path="/services/:id" element={<Layout><ServiceDetails /></Layout>} />
            <Route path="/clients" element={<Layout><Clients /></Layout>} />
            <Route path="/clients/:id/history" element={<Layout><ClientHistory /></Layout>} />
            </Routes>
          </div>
        </Router>
      </AppWithNotifications>
    </SettingsProvider>
  );
}

export default App;