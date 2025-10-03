import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  User, 
  Car, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

const ClientHistory = () => {
  const { clientId } = useParams();
  const { state } = useApp();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dados simulados para demonstração
  const [clientHistory, setClientHistory] = useState({
    contracts: [],
    payments: [],
    services: [],
    vehicles: [],
    summary: {}
  });

  useEffect(() => {
    const loadClientHistory = async () => {
      setLoading(true);
      
      // Buscar cliente
      const foundClient = state.clients.find(c => c.id === clientId);
      setClient(foundClient);

      if (foundClient) {
        // Simular dados de histórico completo
        const mockHistory = {
          contracts: [
            {
              id: 'CONT-001',
              vehicleId: 'VEH-001',
              vehiclePlate: 'ABC-1234',
              vehicleBrand: 'Toyota',
              vehicleModel: 'Corolla',
              startDate: '2024-01-15',
              endDate: null,
              status: 'active',
              monthlyValue: 1350.00,
              totalPaid: 16200.00,
              monthsActive: 12,
              lastPayment: '2024-12-15'
            },
            {
              id: 'CONT-002',
              vehicleId: 'VEH-003',
              vehiclePlate: 'DEF-5678',
              vehicleBrand: 'Honda',
              vehicleModel: 'Civic',
              startDate: '2023-06-01',
              endDate: '2023-12-31',
              status: 'terminated',
              monthlyValue: 1200.00,
              totalPaid: 8400.00,
              monthsActive: 7,
              lastPayment: '2023-12-01'
            }
          ],
          payments: [
            {
              id: 'PAY-001',
              contractId: 'CONT-001',
              referenceMonth: '2024-12-01',
              amount: 1350.00,
              paidAmount: 1350.00,
              paymentDate: '2024-12-15',
              status: 'paid',
              daysLate: 0
            },
            {
              id: 'PAY-002',
              contractId: 'CONT-001',
              referenceMonth: '2024-11-01',
              amount: 1350.00,
              paidAmount: 1350.00,
              paymentDate: '2024-11-10',
              status: 'paid',
              daysLate: 0
            },
            {
              id: 'PAY-003',
              contractId: 'CONT-001',
              referenceMonth: '2024-10-01',
              amount: 1350.00,
              paidAmount: 1350.00,
              paymentDate: '2024-10-18',
              status: 'paid',
              daysLate: 3
            }
          ],
          services: [
            {
              id: 'SERV-001',
              vehicleId: 'VEH-001',
              vehiclePlate: 'ABC-1234',
              type: 'Manutenção Preventiva',
              description: 'Troca de óleo e filtros',
              cost: 250.00,
              date: '2024-11-20',
              status: 'completed',
              responsibleParty: 'company'
            },
            {
              id: 'SERV-002',
              vehicleId: 'VEH-001',
              vehiclePlate: 'ABC-1234',
              type: 'Reparo',
              description: 'Troca de pneu dianteiro',
              cost: 180.00,
              date: '2024-09-15',
              status: 'completed',
              responsibleParty: 'driver'
            }
          ],
          vehicles: [
            {
              id: 'VEH-001',
              licensePlate: 'ABC-1234',
              brand: 'Toyota',
              model: 'Corolla',
              year: 2020,
              startDate: '2024-01-15',
              endDate: null,
              status: 'active',
              totalServices: 5,
              totalServiceCost: 1250.00
            },
            {
              id: 'VEH-003',
              licensePlate: 'DEF-5678',
              brand: 'Honda',
              model: 'Civic',
              year: 2019,
              startDate: '2023-06-01',
              endDate: '2023-12-31',
              status: 'terminated',
              totalServices: 3,
              totalServiceCost: 680.00
            }
          ],
          summary: {
            totalContracts: 2,
            activeContracts: 1,
            terminatedContracts: 1,
            totalPaid: 24600.00,
            averageMonthlyValue: 1275.00,
            totalMonthsActive: 19,
            onTimePayments: 15,
            latePayments: 4,
            totalServices: 8,
            totalServiceCost: 1930.00,
            relationshipStartDate: '2023-06-01',
            lastActivity: '2024-12-15'
          }
        };

        setClientHistory(mockHistory);
      }

      setLoading(false);
    };

    if (clientId) {
      loadClientHistory();
    }
  }, [clientId, state.clients]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      terminated: 'text-red-600 bg-red-100',
      suspended: 'text-yellow-600 bg-yellow-100',
      paid: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      overdue: 'text-red-600 bg-red-100',
      completed: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h2>
          <Link to="/clients" className="text-blue-600 hover:text-blue-700">
            Voltar para lista de clientes
          </Link>
        </div>
      </div>
    );
  }

  const { summary } = clientHistory;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/clients" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600">Histórico completo de relacionamento</p>
            </div>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{client.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Telefone</p>
              <p className="text-gray-900">{client.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">CPF/CNPJ</p>
              <p className="text-gray-900">{client.document}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo de Relacionamento</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalMonthsActive} meses</p>
              <p className="text-sm text-gray-500 mt-1">
                Desde {formatDate(summary.relationshipStartDate)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Média: {formatCurrency(summary.averageMonthlyValue)}/mês
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratos</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalContracts}</p>
              <p className="text-sm text-gray-500 mt-1">
                {summary.activeContracts} ativo(s)
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pontualidade</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((summary.onTimePayments / (summary.onTimePayments + summary.latePayments)) * 100)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {summary.onTimePayments} de {summary.onTimePayments + summary.latePayments} pagamentos
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'contracts', label: 'Contratos', icon: FileText },
              { id: 'payments', label: 'Pagamentos', icon: DollarSign },
              { id: 'vehicles', label: 'Veículos', icon: Car },
              { id: 'services', label: 'Serviços', icon: Wrench }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Atividade Recente */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Pagamento realizado</p>
                        <p className="text-xs text-gray-600">15/12/2024 - {formatCurrency(1350.00)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Manutenção realizada</p>
                        <p className="text-xs text-gray-600">20/11/2024 - Troca de óleo e filtros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Pagamento com atraso</p>
                        <p className="text-xs text-gray-600">18/10/2024 - 3 dias de atraso</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Pagamentos em dia</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">79%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Valor médio mensal</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(summary.averageMonthlyValue)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total em serviços</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalServiceCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Contratos */}
          {activeTab === 'contracts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Contratos</h3>
              <div className="space-y-4">
                {clientHistory.contracts.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{contract.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status === 'active' ? 'Ativo' : 'Encerrado'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(contract.monthlyValue)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Veículo</p>
                        <p className="font-medium">{contract.vehiclePlate} - {contract.vehicleBrand} {contract.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Período</p>
                        <p className="font-medium">
                          {formatDate(contract.startDate)} - {contract.endDate ? formatDate(contract.endDate) : 'Atual'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Pago</p>
                        <p className="font-medium text-green-600">{formatCurrency(contract.totalPaid)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Pagamentos */}
          {activeTab === 'payments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mês Referência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atraso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientHistory.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.referenceMonth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status === 'paid' ? 'Pago' : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.daysLate > 0 ? `${payment.daysLate} dias` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Veículos */}
          {activeTab === 'vehicles' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Veículos</h3>
              <div className="space-y-4">
                {clientHistory.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status === 'active' ? 'Ativo' : 'Encerrado'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Período</p>
                        <p className="font-medium">
                          {formatDate(vehicle.startDate)} - {vehicle.endDate ? formatDate(vehicle.endDate) : 'Atual'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total de Serviços</p>
                        <p className="font-medium">{vehicle.totalServices}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Custo em Serviços</p>
                        <p className="font-medium text-red-600">{formatCurrency(vehicle.totalServiceCost)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Serviços */}
          {activeTab === 'services' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Serviços</h3>
              <div className="space-y-4">
                {clientHistory.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{service.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          Concluído
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(service.cost)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Veículo</p>
                        <p className="font-medium">{service.vehiclePlate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data</p>
                        <p className="font-medium">{formatDate(service.date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Responsável</p>
                        <p className="font-medium">
                          {service.responsibleParty === 'company' ? 'Empresa' : 'Motorista'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-600 text-sm">Descrição</p>
                      <p className="text-gray-900">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientHistory;