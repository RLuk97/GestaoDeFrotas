import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Activity as ActivityIcon, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import apiService from '../services/api';
import { useSettings } from '../context/SettingsContext';

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  } catch {
    return `R$ ${(Number(value || 0)).toFixed(2)}`;
  }
};

const getStatusColor = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
      return '#16a34a';
    case 'in_progress':
      return '#2563eb';
    case 'pending':
      return '#f59e0b';
    case 'deleted':
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getStatusText = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
      return 'Concluído';
    case 'in_progress':
      return 'Em andamento';
    case 'pending':
      return 'Em Análise';
    case 'deleted':
      return 'Excluído';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status || 'Indefinido';
  }
};

const getActivityIcon = (activity) => {
  const st = String(activity.status || '').toLowerCase();
  if (st === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (st === 'pending') return <Clock className="h-5 w-5 text-yellow-600" />;
  if (st === 'deleted' || st === 'cancelled') return <AlertTriangle className="h-5 w-5 text-red-600" />;
  return <ActivityIcon className="h-5 w-5 text-blue-600" />;
};

const Activities = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Usar limite configurável para a página de atividades
        const limit = Number(settings?.activitiesPageLimit) || 50;
        const data = await apiService.getRecentActivities(limit);
        setActivities(Array.isArray(data) ? data : (data?.data || []));
        setError(null);
      } catch (e) {
        console.warn('Falha ao buscar atividades:', e);
        setError('Não foi possível carregar as atividades.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Atividades</h1>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={() => navigate('/dashboard')}
        >
          <Eye className="h-4 w-4" />
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Todas as Atividades Recentes</span>
          </div>
          <div className="text-sm text-gray-500">Últimas {activities.length} entradas</div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Carregando atividades...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhuma atividade encontrada</div>
        ) : (
          <div className="p-4 space-y-2 sm:max-h-[60vh] sm:overflow-y-auto">
            {activities.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className="flex sm:flex-row flex-col sm:items-center p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="bg-gray-100 p-2 rounded-full mr-3">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 break-words whitespace-normal">{activity.description}</div>
                  {(activity.value || 0) > 0 && (
                    <div className="text-sm font-semibold mt-1" style={{ color: activity.status === 'deleted' ? '#ef4444' : '#16a34a' }}>
                      {activity.status === 'deleted' ? '-' : '+'} {formatCurrency(activity.value || 0)}
                    </div>
                  )}
                </div>
                <div className="sm:text-right text-left sm:w-auto w-full flex items-center justify-between sm:block mt-2 sm:mt-0">
                  <span
                    className="inline-block px-2 py-1 rounded text-white text-xs font-semibold"
                    style={{ backgroundColor: getStatusColor(activity.status) }}
                  >
                    {getStatusText(activity.status)}
                  </span>
                  <div className="text-xs text-gray-500 sm:mt-1">
                    {new Date(activity.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;