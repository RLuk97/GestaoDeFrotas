import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Car,
  Wrench,
  Package,
  History,
  Settings,
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Breadcrumb from '../Common/Breadcrumb';
import PageHeader from '../Common/PageHeader';
import Logo from '../Common/Logo';

const Layout = ({ children, pageTitle, pageSubtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/' || location.pathname === '/dashboard'
    },
    {
      name: 'Clientes',
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients')
    },
    {
      name: 'Veículos',
      href: '/vehicles',
      icon: Car,
      current: location.pathname.startsWith('/vehicles')
    },
    {
      name: 'Serviços',
      href: '/services',
      icon: Wrench,
      current: location.pathname.startsWith('/services')
    },
    {
      name: 'Peças',
      href: '/parts',
      icon: Package,
      current: location.pathname.startsWith('/parts')
    },
    {
      name: 'Histórico',
      href: '/history',
      icon: History,
      current: location.pathname.startsWith('/history')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
           <div className="flex h-16 items-center justify-between px-4 bg-brand-primary">
             <h1 className="text-xl font-bold text-white">Gestão de Frota</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 bg-white">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-gray hover:bg-brand-light hover:text-brand-primary'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.current ? 'text-white' : 'text-brand-gray group-hover:text-brand-primary'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarExpanded ? 'lg:w-64' : 'lg:w-16'
      }`}>
        <div className="flex flex-col flex-grow bg-white shadow-sm">
          <div className={`flex h-16 items-center justify-center px-4 ${
              sidebarExpanded ? 'bg-white' : 'bg-brand-primary'
            }`}>
            {sidebarExpanded ? (
              <>
                <div className="flex items-center flex-1">
                  <Logo size="default" showText={sidebarExpanded} isExpanded={sidebarExpanded} />
                </div>
                {/* Botão toggle quando expandido */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="flex-shrink-0 bg-gray-100 border border-gray-300 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
                >
                  <ChevronLeft className="h-4 w-4 text-brand-primary" />
                </button>
              </>
            ) : (
              /* Botão hambúrguer quando recolhido */
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2"
              >
                <div className="flex flex-col space-y-1">
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                  <div className="w-5 h-0.5 bg-white"></div>
                </div>
              </button>
            )}
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 bg-white">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-brand-primary text-white border-r-2 border-brand-primary'
                      : 'text-brand-gray hover:bg-brand-light hover:text-brand-primary'
                  }`}
                  title={!sidebarExpanded ? item.name : ''}
                >
                  <Icon
                    className={`${sidebarExpanded ? 'mr-3' : 'mx-auto'} h-5 w-5 flex-shrink-0 ${
                      item.current ? 'text-white' : 'text-brand-gray group-hover:text-brand-primary'
                    }`}
                  />
                  {sidebarExpanded && item.name}
                </Link>
              );
            })}
          </nav>
          

        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
      }`}>
        {/* Header mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-brand-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-brand-primary"></div>
              <div className="w-5 h-0.5 bg-brand-primary"></div>
              <div className="w-5 h-0.5 bg-brand-primary"></div>
            </div>
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-brand-primary">Gestão de Frota</h1>
            </div>
          </div>
        </div>

        {/* Header desktop fixo */}
        <div className={`hidden lg:block fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarExpanded ? 'left-64' : 'left-16'
        }`}>
          <PageHeader 
            title={pageTitle || 'Gestão de Frota'} 
            subtitle={pageSubtitle}
          />
        </div>

        {/* Conteúdo da página */}
        <main className="pt-6 lg:pt-20 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;