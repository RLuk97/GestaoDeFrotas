import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { Edit, Trash2, Eye, Search, Users, Plus, User, Car, UserCheck, UserX } from 'lucide-react';
import ClientForm from '../components/Common/ClientForm';
import Modal from '../components/Common/Modal';
import ApiService from '../services/api';

const Clients = () => {
  const { state, dispatch } = useApp();
  const { addClientNotification, addClientDeleteNotification } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showView, setShowView] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);
  const itemsPerPage = 5;

  const clients = state.clients;

  // Calcular estatísticas dos clientes
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const inactiveClients = clients.filter(client => client.status === 'inactive').length;

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // Resetar página quando filtrar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (clientData) => {
    try {
      if (editingClient) {
        // Atualizar cliente existente
        const response = await ApiService.updateClient(editingClient.id, clientData);
        dispatch({ 
          type: 'UPDATE_CLIENT', 
          payload: {
            ...response.data,
            id: editingClient.id,
            updatedAt: new Date().toISOString()
          }
        });
        addClientNotification({ ...clientData, name: clientData.name }, true); // true para indicar edição
      } else {
        // Criar novo cliente
        const response = await ApiService.createClient(clientData);
        dispatch({ 
          type: 'ADD_CLIENT', 
          payload: {
            ...response.data,
            createdAt: new Date().toISOString()
          }
        });
        // Adicionar notificação de novo cliente
        addClientNotification(clientData, false); // false para indicar criação
      }
      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = 'Erro ao salvar cliente';
      
      if (error.message) {
         if (error.message.includes('Email já cadastrado') || error.message.includes('já existe um cliente com este email')) {
           errorMessage = 'Este email já está cadastrado para outro cliente. Por favor, use um email diferente.';
         } else if (error.message.includes('CPF/CNPJ já cadastrado') || error.message.includes('já existe um cliente com este CPF/CNPJ')) {
           errorMessage = 'Este CPF/CNPJ já está cadastrado para outro cliente. Por favor, verifique o documento informado.';
         } else if (error.message.includes('Dados inválidos')) {
           errorMessage = 'Por favor, verifique os dados informados e tente novamente.';
         } else {
           errorMessage = error.message;
         }
       }
      
      alert(errorMessage);
    }
  };

  const openViewClient = (client) => {
    setViewingClient(client);
    setShowView(true);
  };

  const closeViewClient = () => {
    setShowView(false);
    setViewingClient(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleAddClient = () => {
    setShowForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        // Buscar dados do cliente antes de excluir para a notificação
        const clientToDelete = state.clients.find(client => client.id === clientId);
        
        await ApiService.deleteClient(clientId);
        dispatch({ type: 'DELETE_CLIENT', payload: clientId });
        
        // Adicionar notificação de exclusão
        if (clientToDelete) {
          addClientDeleteNotification(clientToDelete);
        }
        
        alert('Cliente excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        if (error.message.includes('constraint') || error.message.includes('veículos')) {
          alert('Não é possível excluir este cliente pois ele possui veículos cadastrados. Remova os veículos primeiro.');
        } else {
          alert('Erro ao excluir cliente: ' + error.message);
        }
      }
    }
  };

  const getClientVehicles = (clientId) => {
    return state.vehicles.filter(vehicle => vehicle.client_id === clientId);
  };

  // Formatar CPF/CNPJ para exibição
  const formatDocumentDisplay = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (m, a, b, c, d) => {
        let out = a;
        if (b) out += '.' + b;
        if (c) out += '.' + c;
        if (d) out += '-' + d;
        return out;
      });
    }
    return digits.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (m, a, b, c, d, e) => {
      let out = a;
      if (b) out += '.' + b;
      if (c) out += '.' + c;
      if (d) out += '/' + d;
      if (e) out += '-' + e;
      return out;
    });
  };

  const paginatedClients = currentClients;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">Cadastro e controle de clientes</p>
        </div>
        <button
          onClick={handleAddClient}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-slate-800 transition-colors mt-4 sm:mt-0 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 mr-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">Total de Clientes</p>
              <p className="text-xl font-bold text-gray-900">{totalClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 mr-3">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">Ativos</p>
              <p className="text-xl font-bold text-gray-900">{activeClients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 mr-3">
              <UserX className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-0.5">Inativos</p>
              <p className="text-xl font-bold text-gray-900">{inactiveClients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-light min-w-[140px] px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">Todos Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="md"
      >
        <ClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      {/* Modal de Visualização do Cliente */}
      <Modal
        isOpen={showView}
        onClose={closeViewClient}
        title={viewingClient ? `Cliente: ${viewingClient.name}` : 'Cliente'}
        size="lg"
      >
        {viewingClient && (
          <div className="space-y-6">
            <div className="card card-light">
              <div className="card-header">
                <h2 className="card-title text-brand-primary">Dados do Cliente</h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Nome</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">CPF/CNPJ</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{formatDocumentDisplay(viewingClient.document)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Email</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Telefone</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-brand-muted dark:text-gray-600">Endereço</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Cidade</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Estado</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">CEP</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.zipCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted dark:text-gray-600">Status</p>
                    <p className="font-medium text-brand-primary dark:text-gray-900">{viewingClient.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-light">
              <div className="card-header">
                <h2 className="card-title flex items-center text-brand-primary">
                  <Car className="h-5 w-5 mr-2" />
                  Veículo(s) do Cliente
                </h2>
              </div>
              <div className="card-content">
                {getClientVehicles(viewingClient.id).length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-700">Nenhum veículo cadastrado para este cliente.</p>
                ) : (
                  <div className="space-y-3">
                    {getClientVehicles(viewingClient.id).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50 dark:bg-white dark:border-brand-border">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-white border border-gray-200 mr-3 dark:bg-white dark:border-brand-border">
                            <Car className="h-4 w-4 text-gray-700 dark:text-gray-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-900">{v.brand} {v.model} {v.year}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-700">Placa: {v.license_plate}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-700 dark:bg-white dark:border-brand-border dark:text-gray-700">{v.color || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Nenhum cliente encontrado'
                : 'Nenhum cliente cadastrado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando o primeiro cliente'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button onClick={handleAddClient} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Cliente
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Tabela para md+ */}
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Veículos
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.document}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.email}</p>
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="p-1.5 rounded-lg bg-gray-100 mr-3">
                            <Car className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getClientVehicles(client.id).length} veículo(s)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {client.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openViewClient(client)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lista em cards para mobile */}
            <div className="md:hidden space-y-3">
              {paginatedClients.map((client) => (
                <div key={client.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.document}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="text-gray-500">Email: </span>{client.email}
                    </div>
                    <div>
                      <span className="text-gray-500">Telefone: </span>{client.phone}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-lg bg-gray-100 mr-2">
                        <Car className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {getClientVehicles(client.id).length} veículo(s)
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => openViewClient(client)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}</span> a{' '}
                      <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredClients.length)}</span> de{' '}
                      <span className="font-semibold text-gray-900">{filteredClients.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px bg-white border border-gray-200" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border-r border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'z-10 bg-brand-primary text-white border-brand-primary'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-200'
                          }`}
                          style={{ minWidth: '40px' }}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
};

export default Clients;