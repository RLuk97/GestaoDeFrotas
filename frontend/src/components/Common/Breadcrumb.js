import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { state } = useApp();

  const breadcrumbNameMap = {
    '': 'Dashboard',
    'dashboard': 'Dashboard',
    'activities': 'Atividades',
    'notifications': 'Notificações',
    'rentals': 'Dashboard Financeiro',
    'default-report': 'Relatório de Inadimplência',
    'payment-control': 'Controle de Pagamentos',
    'contract-history': 'Histórico de Contratos',
  'vehicle-transfers': 'Transferências de Veículos',
  'partial-payments': 'Pagamentos Parciais',
  'outstanding-balances': 'Saldos Devedores',
    'vehicles': 'Veículos',
    'services': 'Serviços',
    'parts': 'Peças',
    'history': 'Histórico',
    'clients': 'Clientes'
  };

  const getBreadcrumbName = (pathname, index) => {
    const previousPath = pathnames[index - 1];

    // Para veículos, preferir mostrar a placa como identificador
    if (previousPath === 'vehicles') {
      const vehicle = state?.vehicles?.find(
        (v) => String(v.id) === String(pathname) || String(v.license_plate) === String(pathname)
      );
      return vehicle?.license_plate || 'Veículo';
    }

    // Para serviços, mostrar numeração sequencial baseada na lista
    if (previousPath === 'services') {
      // Se for um número na URL, use diretamente
      if (!isNaN(pathname)) {
        return `Serviço #${pathname}`;
      }
      // Caso seja UUID, localizar índice
      const index = state?.services?.findIndex(s => String(s.id) === String(pathname));
      if (index !== undefined && index >= 0) {
        return `Serviço #${index + 1}`;
      }
      return 'Serviço';
    }

    // IDs numéricos para outras rotas
    if (!isNaN(pathname)) {
      if (previousPath === 'services') {
        return `Serviço #${pathname}`;
      }
      return `Item #${pathname}`;
    }

    return breadcrumbNameMap[pathname] || pathname;
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const breadcrumbName = getBreadcrumbName(pathname, index);

        return (
          <React.Fragment key={pathname}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">
                {breadcrumbName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-gray-900 transition-colors"
              >
                {breadcrumbName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;