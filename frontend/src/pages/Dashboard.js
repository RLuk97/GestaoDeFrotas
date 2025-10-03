import React, { useState, useEffect } from 'react';
import { Car, Wrench, AlertTriangle, DollarSign, Plus, Calendar, FileText, Eye, Users, User, UserCheck, UserX, Gauge, CheckCircle, Clock } from 'lucide-react';
import apiService from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    servicesInProgress: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de veículos, serviços e clientes
      const [vehiclesResponse, servicesResponse, clientsResponse] = await Promise.all([
        apiService.getVehicles(),
        apiService.getServices(),
        apiService.getClients()
      ]);

      const vehicles = vehiclesResponse || [];
      const services = servicesResponse || [];
      const clients = clientsResponse || [];

      // Calcular métricas
      const totalVehicles = vehicles.length;
      const servicesInProgress = services.filter(service => 
        service.paymentStatus === 'pending' || 
        service.paymentStatus === 'in_progress'
      ).length;
      
      // Total de clientes cadastrados
      const totalClients = clients.length;

      // Despesa mensal - serviços concluídos no mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const parseLocalYmd = (ymd) => {
        if (!ymd || typeof ymd !== 'string') return null;
        const [y, m, d] = ymd.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d); // data local
      };

      const monthlyExpense = services
        .filter(service => {
          const dateStr = service.exitDate || service.entryDate;
          const serviceDate = parseLocalYmd(dateStr);
          if (!serviceDate) return false;
          return (
            serviceDate.getMonth() === currentMonth &&
            serviceDate.getFullYear() === currentYear &&
            service.paymentStatus === 'completed'
          );
        })
        .reduce((total, service) => total + (parseFloat(service.totalValue) || 0), 0);

      // Atividades recentes (últimos 5 serviços)
      const recentActivities = services
        .sort((a, b) => new Date(b.data_servico || b.createdAt) - new Date(a.data_servico || a.createdAt))
        .slice(0, 5)
        .map(service => ({
          id: service.id,
          description: service.descricao || `Serviço para veículo ${service.veiculo_id}`,
          value: parseFloat(service.valor) || 0,
          status: service.status,
          date: service.data_servico || service.createdAt
        }));

      setDashboardData({
        totalVehicles,
        servicesInProgress,
        totalClients,
        monthlyRevenue: monthlyExpense,
        recentActivities
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Manter valores padrão em caso de erro
      setDashboardData({
        totalVehicles: 0,
        servicesInProgress: 0,
        totalClients: 0,
        monthlyRevenue: 0,
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745'; // Verde para concluído
      case 'in_progress':
        return '#ffc107'; // Amarelo para em andamento
      case 'pending':
        return '#17a2b8'; // Azul para pendente
      case 'cancelled':
        return '#dc3545'; // Vermelho para cancelado
      default:
        return '#6c757d'; // Cinza para outros
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#f8fafc',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: '0 0 8px 0'
        }}>
          Dashboard
        </h1>
        <p style={{ 
          color: '#6b7280',
          margin: 0
        }}>
          Visão geral do seu sistema de gestão de frotas
        </p>
      </div>

      {/* Cards de Métricas */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total de Veículos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Car size={28} color="white" />
          </div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            Total de Veículos
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {dashboardData.totalVehicles}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            2º ativos
          </div>
        </div>

        {/* Serviços em Andamento */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(to right, #f59e0b, #d97706)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Wrench size={28} color="white" />
          </div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            Serviços em Andamento
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {dashboardData.servicesInProgress}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            Em execução
          </div>
        </div>

        {/* Total de Clientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Users size={28} color="white" />
          </div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            Total de Clientes
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {dashboardData.totalClients}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            Cadastrados
          </div>
        </div>

        {/* Despesa do Mês */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <DollarSign size={28} color="white" />
          </div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            Despesa do Mês
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {formatCurrency(dashboardData.monthlyRevenue)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            Gastos com serviços
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            marginTop: '4px'
          }}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' / ')}
          </div>
        </div>
      </div>

      {/* Seções Inferiores */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        flex: 1,
        overflowY: 'auto'
      }}>
        {/* Ações Rápidas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0 0 20px 0'
          }}>
            Ações Rápidas
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <Plus size={20} color="#ffffff" style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Cadastrar Veículo</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Adicionar novo veículo à frota</div>
              </div>
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <Calendar size={20} color="#ffffff" style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Agendar Manutenção</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Agendar serviço de manutenção</div>
              </div>
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <FileText size={20} color="#ffffff" style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Relatórios</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Visualizar relatórios e dados</div>
              </div>
            </button>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1f2937',
              margin: 0
            }}>
              Atividades Recentes
            </h2>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <Eye size={16} />
              Ver Todas
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={activity.id || index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #f3f4f6'
                }}>
                  <div style={{
                    backgroundColor: '#dbeafe',
                    padding: '8px',
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}>
                    <Wrench size={16} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#1f2937',
                      fontSize: '14px'
                    }}>
                      {activity.description}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#16a34a'
                    }}>
                      + {formatCurrency(activity.value || 0)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getStatusColor(activity.status)
                    }}>
                      {getStatusText(activity.status)}
                    </span>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      marginTop: '4px'
                    }}>
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                color: '#6b7280'
              }}>
                <p>Nenhuma atividade recente encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
