import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Parts from './pages/Parts';
import History from './pages/History';
import Clients from './pages/Clients';
import VehicleDetails from './pages/VehicleDetails';
import ServiceDetails from './pages/ServiceDetails';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;