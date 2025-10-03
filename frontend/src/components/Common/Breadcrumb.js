import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {
    '': 'Dashboard',
    'dashboard': 'Dashboard',
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
    // Se for um ID numérico, buscar o nome do item
    if (!isNaN(pathname)) {
      const previousPath = pathnames[index - 1];
      if (previousPath === 'vehicles') {
        return `Veículo #${pathname}`;
      }
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
        to="/"
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