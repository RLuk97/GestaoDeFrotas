import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Plus,
  Search,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import ServiceForm from '../components/Services/ServiceForm';
import Modal from '../components/Common/Modal';
import ApiService from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Services = () => {
  const { state, dispatch, getVehicleById, refreshVehicles } = useApp();
  const { addServiceNotification } = useNotifications();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Debug logs
  console.log('=== Services Debug ===');
  console.log('location.search:', location.search);
  console.log('searchParams.get("vehicle"):', searchParams.get('vehicle'));
  console.log('searchParams.get("openModal"):', searchParams.get('openModal'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle') || 'all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { settings } = useSettings();
  const itemsPerPage = Number(settings?.itemsPerPage) || 5;

  // Detectar parâmetro openModal na URL
  useEffect(() => {
    console.log('=== Services useEffect openModal ===');
    const urlParams = new URLSearchParams(location.search);
    console.log('urlParams.get("openModal"):', urlParams.get('openModal'));
    if (urlParams.get('openModal') === 'true') {
      console.log('Abrindo modal automaticamente');
      handleAddService();
      // Evitar reabertura do modal ao atualizar estado
      const params = new URLSearchParams(location.search);
      params.delete('openModal');
      setSearchParams(params);
    }
  }, [location]);

  // Sincronizar filtro de veículo com parâmetros da URL
  useEffect(() => {
    const nextVehicle = searchParams.get('vehicle') || 'all';
    setVehicleFilter(nextVehicle);
  }, [location.search]);

  // Filtrar e ordenar serviços
  // Construir lista de meses disponíveis com base nas datas dos serviços
  const monthOptions = (() => {
    const toKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const toLabel = (date) => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${months[date.getMonth()]}/${date.getFullYear()}`;
    };
    const keys = new Map();
    (state.services || []).forEach((s) => {
      const d = new Date(s.entryDate);
      if (!isNaN(d)) {
        const k = toKey(d);
        if (!keys.has(k)) keys.set(k, toLabel(d));
      }
    });
    return Array.from(keys.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  })();

  const filteredServices = state.services
    .filter(service => {
      const vehicle = getVehicleById(service.vehicleId);
      
      // Função para converter service.type em string para busca
      const getServiceTypeString = (type) => {
        if (!type) return '';
        if (Array.isArray(type)) {
          return type.join(' ').toLowerCase();
        }
        return String(type).toLowerCase();
      };
      
      const matchesSearch = 
        getServiceTypeString(service.type).includes(searchTerm.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle?.plate || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || service.paymentStatus === statusFilter;
      const matchesVehicle = vehicleFilter === 'all' || service.vehicleId === parseInt(vehicleFilter);
      const matchesMonth = (() => {
        if (monthFilter === 'all') return true;
        const d = new Date(service.entryDate);
        if (isNaN(d)) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthFilter;
      })();
      
      return matchesSearch && matchesStatus && matchesVehicle && matchesMonth;
    })
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate)); // Ordenar por data mais recente

  // Lógica de paginação
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, vehicleFilter, monthFilter]);

  // Fallback local para garantir que o card do veículo atualize imediatamente
  const syncVehicleStatusLocally = (vehicleId, updatedService) => {
    try {
      if (!vehicleId) return;

      // Substituir o serviço atualizado na lista local para avaliar corretamente
      const servicesForVehicle = state.services
        .map((s) => (updatedService && s.id === updatedService.id ? updatedService : s))
        .filter((s) => (s.vehicleId || s.vehicle_id) === vehicleId);

      if (servicesForVehicle.length === 0) return;

      const allCompleted = servicesForVehicle.every((s) => {
        const ps = String(s.paymentStatus || '').toLowerCase();
        const st = String(s.status || '').toLowerCase();
        return ps === 'completed' || st === 'concluído' || st === 'completed';
      });

      const vehicle = state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return;

      const nextStatus = allCompleted ? 'active' : 'maintenance';
      if (vehicle.status !== nextStatus) {
        dispatch({
          type: 'UPDATE_VEHICLE',
          payload: { ...vehicle, status: nextStatus },
        });
        console.log('Status do veículo ajustado localmente:', vehicleId, '=>', nextStatus);
      }
    } catch (e) {
      console.warn('Falha no fallback local de status do veículo:', e);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormSubmit = async (serviceData) => {
    try {
      console.log('=== INÍCIO handleFormSubmit ===');
      console.log('editingService:', editingService);
      console.log('serviceData recebido:', serviceData);
      
      if (editingService) {
        // Atualizar serviço existente
        console.log('Atualizando serviço existente...');
        const response = await ApiService.updateService(editingService.id, serviceData);
        console.log('Resposta da API (update):', response);
        
        const updatedService = response.data || response;
        console.log('Serviço atualizado extraído:', updatedService);
        
        dispatch({
          type: 'UPDATE_SERVICE',
          payload: updatedService
        });
        
        // Adicionar notificação de serviço editado (true = edição)
        addServiceNotification(serviceData, true);

        // Sincronizar status do veículo após edição de serviço
        try {
          const vehicleIdForSync = updatedService?.vehicleId || serviceData?.vehicle_id;
          if (vehicleIdForSync) {
            const updatedVehicle = await ApiService.getVehicleById(vehicleIdForSync);
            if (updatedVehicle) {
              dispatch({
                type: 'UPDATE_VEHICLE',
                payload: updatedVehicle
              });
              console.log('Veículo sincronizado após edição de serviço:', updatedVehicle);
            }
          } else {
            // Fallback: recarregar lista completa de veículos
            await refreshVehicles();
          }
        } catch (vehErr) {
          console.warn('Falha ao sincronizar veículo após edição de serviço, aplicando fallback:', vehErr);
          await refreshVehicles();
        }
        // Garantir atualização imediata do card do veículo na UI
        const vehicleIdForLocalSync = updatedService?.vehicleId || serviceData?.vehicle_id;
        syncVehicleStatusLocally(vehicleIdForLocalSync, updatedService);
        
        console.log('Serviço atualizado com sucesso');
      } else {
        console.log('🚀 === CRIANDO NOVO SERVIÇO ===');
        const response = await ApiService.createService(serviceData);
        console.log('📡 Resposta completa da API:', response);
        
        const newService = response.data || response;
        console.log('📋 Novo serviço extraído:', newService);
        console.log('🚗 vehicleId no serviço (camelCase):', newService.vehicleId);
        console.log('🚗 vehicle_id no serviço (snake_case):', newService.vehicle_id);
        
        console.log('📤 Despachando ADD_SERVICE com payload:', newService);
        dispatch({
          type: 'ADD_SERVICE',
          payload: newService
        });
        
        // Adicionar notificação de serviço criado (false = criação)
        addServiceNotification(serviceData, false);
        
        // Recarregar dados de veículos para atualizar status e quilometragem
        await refreshVehicles();
        
        // Limpar filtro de veículo da URL para não esconder a lista
        const params = new URLSearchParams(location.search);
        params.delete('vehicle');
        params.delete('openModal');
        setSearchParams(params);
        setVehicleFilter('all');
        
        console.log('Novo serviço criado com sucesso');
      }
      
      setShowForm(false);
      setEditingService(null);
      console.log('=== FIM handleFormSubmit ===');
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('Erro ao salvar serviço: ' + error.message);
    }
  };

  const handlePaymentStatusChange = async (serviceId, newStatus) => {
    try {
      console.log('=== handlePaymentStatusChange ===');
      console.log('serviceId:', serviceId);
      console.log('newStatus:', newStatus);
      
      // Usar o novo método específico para atualização de status
      const response = await ApiService.updateServiceStatus(serviceId, newStatus);
      console.log('Resposta da API:', response);
      
      const updatedService = response.data || response;
      console.log('Serviço atualizado:', updatedService);
      
      dispatch({
        type: 'UPDATE_SERVICE',
        payload: updatedService
      });

      // Sincronizar status do veículo no contexto assim que o serviço for concluído
      if (updatedService && updatedService.vehicleId) {
        try {
          const updatedVehicle = await ApiService.getVehicleById(updatedService.vehicleId);
          if (updatedVehicle) {
            dispatch({
              type: 'UPDATE_VEHICLE',
              payload: updatedVehicle
            });
            console.log('Veículo sincronizado após atualização de serviço:', updatedVehicle);
          }
        } catch (vehErr) {
          console.warn('Falha ao sincronizar veículo após status de serviço:', vehErr);
        }
        // Fallback local para refletir imediatamente no card
        syncVehicleStatusLocally(updatedService.vehicleId, updatedService);
      }
      
      console.log('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      alert('Erro ao atualizar status: ' + error.message);
    }
  };



  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const stats = {
    total: filteredServices.length,
    completed: filteredServices.filter(s => s.paymentStatus === 'completed').length,
    pending: filteredServices.filter(s => s.paymentStatus === 'pending').length,
    in_progress: filteredServices.filter(s => s.paymentStatus === 'in_progress').length,
    cancelled: filteredServices.filter(s => s.paymentStatus === 'cancelled').length,
    totalRevenue: filteredServices.reduce((sum, s) => sum + (parseFloat(s.totalValue) || 0), 0),
    completedRevenue: filteredServices.filter(s => s.paymentStatus === 'completed').reduce((sum, s) => sum + (parseFloat(s.totalValue) || 0), 0)
  };

  // Resumo de despesas do mês selecionado
  const selectedMonthLabel = monthFilter === 'all'
    ? null
    : (monthOptions.find(([v]) => v === monthFilter)?.[1] || monthFilter);

  const monthlyExpense = stats.totalRevenue;

  const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const statusLabelPt = (st) => ({
    pending: 'Em Análise',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }[st] || st);

  const generateMonthlyReportPDF = () => {
    try {
      if (monthFilter === 'all' || filteredServices.length === 0) return;

      const doc = new jsPDF();
      const title = `Relatório de Despesas - ${selectedMonthLabel}`;
      doc.setFontSize(16);
      doc.text(title, 14, 18);

      doc.setFontSize(11);
      doc.text(`Total de serviços: ${stats.total}`, 14, 26);
      doc.text(`Despesa total: R$ ${formatCurrency(monthlyExpense)}`, 14, 32);
      doc.text(`Concluídos: ${stats.completed} • Em andamento: ${stats.in_progress} • Em análise: ${stats.pending} • Cancelados: ${stats.cancelled}`, 14, 38);

      const rows = filteredServices.map((s) => {
        const vehicle = getVehicleById(s.vehicleId);
        const vehiclePlate = s.vehiclePlate || s.vehicle_license_plate || vehicle?.plate || '';
        const typeText = Array.isArray(s.type) ? s.type.join(', ') : (s.type || '');
        const entry = s.entryDate ? s.entryDate.split('-').reverse().join('/') : '';
        const exit = s.exitDate ? s.exitDate.split('-').reverse().join('/') : '';
        const statusText = statusLabelPt(s.paymentStatus);
        const valueText = `R$ ${formatCurrency(parseFloat(s.totalValue) || 0)}`;
        return [vehiclePlate, typeText, entry, exit, statusText, valueText];
      });

      autoTable(doc, {
        startY: 44,
        head: [['Veículo', 'Serviço', 'Entrada', 'Saída', 'Status', 'Valor']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [33, 150, 243] }
      });

      doc.save(`relatorio-despesas-${monthFilter}.pdf`);
    } catch (e) {
      console.warn('Falha ao gerar PDF:', e);
      alert('Não foi possível gerar o PDF. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Serviços</h1>
          <p className="text-gray-600">Controle de manutenções</p>
        </div>
        <button
          onClick={handleAddService}
          className="inline-flex items-center px-4 py-2 bg-brand-primary hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-3">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Em Andamento</p>
              <p className="text-xl font-bold text-gray-900">{stats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Concluídos</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Em Análise</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending + stats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 mr-3">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Cancelados</p>
              <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por tipo de serviço, descrição ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          {/* Filtros */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-light min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900"
            >
              <option value="all">Todos Status</option>
              <option value="completed">Concluídos</option>
              <option value="in_progress">Em Andamento</option>
              <option value="pending">Em Análise</option>
              <option value="cancelled">Cancelados</option>
            </select>

            {/* Filtro por mês */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="select-light min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white text-gray-900"
            >
              <option value="all">Todos Meses</option>
              {monthOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
      </div>
    </div>

      {/* Resumo de Despesas do Mês Selecionado */}
      {monthFilter !== 'all' && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-3">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesa do mês {selectedMonthLabel}</p>
              <p className="text-xl font-bold text-gray-900">R$ {formatCurrency(monthlyExpense)}</p>
              <p className="text-xs text-gray-600">Serviços: {stats.total} • Concluídos: {stats.completed} • Em andamento: {stats.in_progress} • Em análise: {stats.pending} • Cancelados: {stats.cancelled}</p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={generateMonthlyReportPDF}
              disabled={filteredServices.length === 0}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      )}

      {/* Lista de Serviços */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg w-fit mx-auto mb-4">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Nenhum serviço encontrado'
                : 'Nenhum serviço cadastrado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece registrando o primeiro serviço'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && vehicleFilter === 'all' && (
              <button onClick={handleAddService} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Serviço
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datas
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedServices
                  .sort((a, b) => {
                    const dateA = new Date(a.entryDate);
                    const dateB = new Date(b.entryDate);
                    // Verificar se as datas são válidas antes de comparar
                    if (isNaN(dateA) && isNaN(dateB)) return 0;
                    if (isNaN(dateA)) return 1;
                    if (isNaN(dateB)) return -1;
                    return dateB - dateA;
                  })
                  .map((service) => {
                    const vehicle = getVehicleById(service.vehicleId);
                    // Usar dados relacionados da API se disponíveis, senão usar dados do estado local
                    const vehiclePlate = service.vehiclePlate || service.vehicle_license_plate || vehicle?.plate;
                    const vehicleBrand = service.vehicleBrand || service.vehicle_brand || vehicle?.brand;
                    const vehicleModel = service.vehicleModel || service.vehicle_model || vehicle?.model;
                    
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
                              <Car className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vehiclePlate}</p>
                              <p className="text-sm text-gray-500">{vehicleBrand} {vehicleModel}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {Array.isArray(service.type) ? (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {service.type.map((type, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span>{service.type}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{service.mileage?.toLocaleString()} km</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Entrada: {service.entryDate ? service.entryDate.split('-').reverse().join('/') : 'Data inválida'}</span>
                            </div>
                            {service.exitDate && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                <span>Saída: {service.exitDate.split('-').reverse().join('/')}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <p className="text-sm font-medium text-gray-900">R$ {(parseFloat(service.totalValue) || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getStatusIcon(service.paymentStatus)}
                            <select
                              value={service.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(service.id, e.target.value)}
                              className="select-light text-sm border-0 bg-white focus:ring-0 font-medium text-gray-900 cursor-pointer"
                            >
                              <option value="pending">Em Análise</option>
                              <option value="in_progress">Em Andamento</option>
                              <option value="completed">Concluído</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <Link
                              to={`/services/${service.id}`}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Próxima
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredServices.length)}</span> de{' '}
                      <span className="font-medium">{filteredServices.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                            page === currentPage
                              ? 'z-10 bg-brand-primary border-brand-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                          style={{ minWidth: '40px' }}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingService(null);
          // Limpar parâmetros da URL ao fechar o modal
          const params = new URLSearchParams(location.search);
          params.delete('vehicle');
          params.delete('openModal');
          setSearchParams(params);
          setVehicleFilter('all');
        }}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        size="lg"
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
            // Limpar parâmetros da URL ao cancelar
            const params = new URLSearchParams(location.search);
            params.delete('vehicle');
            params.delete('openModal');
            setSearchParams(params);
            setVehicleFilter('all');
          }}
          preselectedVehicleId={(() => {
            const preselectedId = vehicleFilter !== 'all' ? vehicleFilter : 
              (searchParams.get('vehicle') || null);
            
            return preselectedId;
          })()}
        />
      </Modal>
    </div>
  );
};

export default Services;