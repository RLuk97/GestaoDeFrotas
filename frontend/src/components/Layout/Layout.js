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
    <div className="min-h-screen flex bg-brand-surface">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-brand-background shadow-xl border-r border-brand-border">
           <div className="flex h-16 items-center justify-between px-4 bg-brand-primary">
             <h1 className="text-xl font-bold text-white">Gestão de Frota</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-slate-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className={`flex-1 space-y-1 px-3 py-4 ${
            sidebarExpanded ? 'bg-brand-background' : 'bg-gray-900'
          }`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.current
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-brand-muted hover:bg-brand-hover hover:text-brand-primary'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      item.current ? 'text-white' : 'text-brand-muted group-hover:text-brand-primary'
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
        <div className={`flex flex-col flex-grow shadow-sm ${
          sidebarExpanded ? 'border-r border-brand-border bg-brand-background' : 'bg-gray-900'
        }`}>
          <div className={`flex h-16 items-center justify-center px-4 ${
              sidebarExpanded ? 'bg-brand-background' : 'bg-brand-primary'
            }`}>
            {sidebarExpanded ? (
              <>
                <div className="flex items-center flex-1">
                  <Logo size="default" showText={sidebarExpanded} isExpanded={sidebarExpanded} />
                </div>
                {/* Botão toggle quando expandido */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="flex-shrink-0 bg-brand-hover border border-brand-border rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-slate-200 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 text-brand-secondary" />
                </button>
              </>
            ) : (
              /* Botão hambúrguer quando recolhido */
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="flex flex-col space-y-1">
                  <div className="w-5 h-0.5 bg-white rounded-full"></div>
                  <div className="w-5 h-0.5 bg-white rounded-full"></div>
                  <div className="w-5 h-0.5 bg-white rounded-full"></div>
                </div>
              </button>
            )}
          </div>
          <nav className={`flex-1 space-y-1 px-3 py-4 ${
            sidebarExpanded ? 'bg-brand-background' : 'bg-gray-900'
          }`}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.current
                      ? 'bg-brand-primary text-white shadow-sm border-l-4 border-brand-accent'
                      : sidebarExpanded 
                        ? 'text-brand-muted hover:bg-brand-hover hover:text-brand-primary'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={!sidebarExpanded ? item.name : ''}
                >
                  <Icon
                    className={`${sidebarExpanded ? 'mr-3' : 'mx-auto'} h-5 w-5 flex-shrink-0 transition-colors ${
                      item.current 
                        ? 'text-white' 
                        : sidebarExpanded
                          ? 'text-brand-muted group-hover:text-brand-primary'
                          : 'text-gray-300 group-hover:text-white'
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
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-brand-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-brand-primary lg:hidden hover:bg-brand-hover rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <div className="flex flex-col space-y-1">
              <div className="w-5 h-0.5 bg-brand-primary rounded-full"></div>
              <div className="w-5 h-0.5 bg-brand-primary rounded-full"></div>
              <div className="w-5 h-0.5 bg-brand-primary rounded-full"></div>
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
        <main className="pt-6 lg:pt-20 min-h-screen scrollbar-hide">
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