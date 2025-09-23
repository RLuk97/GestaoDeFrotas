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
          <Routes>
            <Route path="/" element={
              <Layout pageTitle="Dashboard" pageSubtitle="Visão geral do sistema">
                <Dashboard />
              </Layout>
            } />
            <Route path="/dashboard" element={
              <Layout pageTitle="Dashboard" pageSubtitle="Visão geral do sistema">
                <Dashboard />
              </Layout>
            } />
            <Route path="/vehicles" element={
              <Layout pageTitle="Veículos" pageSubtitle="Gerenciamento da frota">
                <Vehicles />
              </Layout>
            } />
            <Route path="/vehicles/:id" element={
              <Layout pageTitle="Detalhes do Veículo" pageSubtitle="Informações completas">
                <VehicleDetails />
              </Layout>
            } />
            <Route path="/services" element={
              <Layout pageTitle="Serviços" pageSubtitle="Controle de manutenções">
                <Services />
              </Layout>
            } />
            <Route path="/services/:id" element={
              <Layout pageTitle="Detalhes do Serviço" pageSubtitle="Informações da manutenção">
                <ServiceDetails />
              </Layout>
            } />
            <Route path="/parts" element={
              <Layout pageTitle="Peças" pageSubtitle="Estoque e inventário">
                <Parts />
              </Layout>
            } />
            <Route path="/clients" element={
              <Layout pageTitle="Clientes" pageSubtitle="Cadastro de clientes">
                <Clients />
              </Layout>
            } />
            <Route path="/history" element={
              <Layout pageTitle="Histórico" pageSubtitle="Relatórios e histórico">
                <History />
              </Layout>
            } />
        </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;