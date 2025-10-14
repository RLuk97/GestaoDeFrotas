import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Wrench, AlertTriangle, DollarSign, Plus, Calendar, FileText, Eye, Users, User, UserCheck, UserX, Gauge, CheckCircle, Clock, Trash2, Edit as EditIcon } from 'lucide-react';
import apiService from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalServices: 0,
    servicesInProgress: 0,
    totalClients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados com resiliência: não quebrar se atividades falharem
      const results = await Promise.allSettled([
        apiService.getVehicles(),
        apiService.getServices(),
        apiService.getClients(),
        apiService.getRecentActivities(Number(settings?.dashboardActivitiesLimit) || 5)
      ]);

      const vehicles = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
      const services = results[1].status === 'fulfilled' ? (results[1].value || []) : [];
      const clients = results[2].status === 'fulfilled' ? (results[2].value || []) : [];
      const recentActivitiesApi = results[3].status === 'fulfilled' ? (results[3].value || []) : [];
      if (results[3].status !== 'fulfilled') {
        console.warn('Atividades recentes indisponíveis:', results[3].reason);
      }

      // Calcular métricas
      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter(v => (v.status || '').toLowerCase() === 'active').length;
      const totalServices = services.length;
      // Alinhar com a página de Serviços: "Em Andamento" = paymentStatus === 'in_progress'
      const servicesInProgress = services.filter(service => 
        String(service.paymentStatus || '').toLowerCase() === 'in_progress'
      ).length;
      
      // Total de clientes cadastrados
      const totalClients = clients.length;
      const activeClients = clients.filter(c => String(c.status || '').toLowerCase() === 'active').length;

      // Despesa mensal - alinhar com página de Serviços: soma de todos
      // serviços do mês atual com base na data de entrada (entryDate),
      // independentemente do status.
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const parseLocalYmd = (ymd) => {
        if (!ymd || typeof ymd !== 'string') return null;
        const [y, m, d] = ymd.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d); // data local
      };

      const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const monthlyExpense = services
        .filter(service => {
          const d = new Date(service.entryDate);
          if (isNaN(d)) return false;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return key === currentKey;
        })
        .reduce((total, service) => total + (parseFloat(service.totalValue) || 0), 0);

      // Atividades recentes vindas da API
      const recentActivities = Array.isArray(recentActivitiesApi) ? recentActivitiesApi : [];

      setDashboardData({
        totalVehicles,
        activeVehicles,
        totalServices,
        servicesInProgress,
        totalClients,
        activeClients,
        monthlyRevenue: monthlyExpense,
        recentActivities
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Manter valores padrão em caso de erro
      setDashboardData({
        totalVehicles: 0,
        activeVehicles: 0,
        totalServices: 0,
        servicesInProgress: 0,
        totalClients: 0,
        activeClients: 0,
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
      case 'created':
        return '#3b82f6'; // Azul para criado
      case 'updated':
        return '#a78bfa'; // Roxo para atualizado
      case 'deleted':
        return '#ef4444'; // Vermelho para excluído
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
        return 'Em Análise';
      case 'cancelled':
        return 'Cancelado';
      case 'created':
        return 'Criado';
      case 'updated':
        return 'Atualizado';
      case 'deleted':
        return 'Excluído';
      default:
        return 'Desconhecido';
    }
  };

  // Ícone por tipo de entidade/ação
  const getActivityIcon = (activity) => {
    const type = String(activity.entityType || '').toLowerCase();
    const status = String(activity.status || '').toLowerCase();
    const color = getStatusColor(status);
    const commonStyle = { marginRight: '12px' };
    if (status === 'deleted') return <Trash2 size={16} color={color} style={commonStyle} />;
    if (status === 'updated') return <EditIcon size={16} color={color} style={commonStyle} />;
    if (type === 'vehicle') return <Car size={16} color={color} style={commonStyle} />;
    if (type === 'client') return <Users size={16} color={color} style={commonStyle} />;
    return <Wrench size={16} color={color} style={commonStyle} />; // default service
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
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
            {dashboardData.activeVehicles} ativos
          </div>
        </div>

        {/* Total de Serviços */}
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
            Total de Serviços
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            margin: '0 0 4px 0'
          }}>
            {dashboardData.totalServices}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            {dashboardData.servicesInProgress} em andamento
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
            {dashboardData.activeClients} ativos
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Ações Rápidas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'none',
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
          
          <div
            className="quick-actions-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '204px',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '6px',
              paddingTop: '6px',
              paddingBottom: '6px'
            }}
          >
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              minHeight: '60px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/vehicles?openModal=true')}
            >
              <Plus size={20} color="#ffffff" style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Cadastrar Veículo</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Adicionar novo veículo à frota</div>
              </div>
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              minHeight: '60px',
              background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/services?openModal=true')}
            >
              <Calendar size={20} color="#ffffff" style={{ marginRight: '12px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>Agendar Manutenção</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Agendar serviço de manutenção</div>
              </div>
            </button>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              minHeight: '60px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: '#ffffff',
              boxShadow: 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => navigate('/activities')}
            >
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
            }} onClick={() => navigate('/activities')}>
              <Eye size={16} />
              Ver Todas
            </button>
          </div>
          
          <div
            className="recent-activities-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '192px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}
          >
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="activity-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '60px',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <div style={{
                    backgroundColor: '#f1f5f9',
                    padding: '8px',
                    borderRadius: '50%',
                    marginRight: '12px'
                  }}>
                    {getActivityIcon(activity)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#1f2937',
                      fontSize: '14px',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'normal'
                    }}>
                      {activity.description}
                    </div>
                    {(activity.value || 0) > 0 && (
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: activity.status === 'deleted' ? '#ef4444' : '#16a34a'
                      }}>
                        {activity.status === 'deleted' ? '-' : '+'} {formatCurrency(activity.value || 0)}
                      </div>
                    )}
                  </div>
                  <div className="activity-meta" style={{ textAlign: 'right' }}>
                    <span className="activity-status-pill" style={{
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
              /* Ajustes responsivos para listas com rolagem em mobile */
              @media (max-width: 640px) {
                .quick-actions-list,
                .recent-activities-list {
                  max-height: none !important;
                  overflow-y: visible !important;
                  padding-right: 0 !important;
                }
                /* Tornar itens das atividades em duas linhas no mobile */
                .activity-item {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                  min-height: auto !important;
                  gap: 6px !important;
                }
                .activity-meta {
                  width: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  text-align: left !important;
                  margin-top: 4px !important;
                }
                .activity-status-pill {
                  flex-shrink: 0 !important;
                }
              }
              /* Ajustes responsivos para tablets (sidebar aberta reduz área útil) */
              @media (max-width: 1024px) {
                .recent-activities-list {
                  max-height: none !important;
                  overflow-y: visible !important;
                  padding-right: 0 !important;
                }
                .activity-item {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                  min-height: auto !important;
                  gap: 6px !important;
                }
                .activity-meta {
                  width: 100% !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  text-align: left !important;
                  margin-top: 4px !important;
                }
                .activity-status-pill {
                  flex-shrink: 0 !important;
                }
              }
            `}
          </style>
    </div>
  );
};

export default Dashboard;
