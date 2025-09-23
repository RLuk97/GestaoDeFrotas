import React from 'react';
import { History as HistoryIcon, FileText, AlertTriangle } from 'lucide-react';

const History = () => {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Histórico Completo</h1>
          <p className="text-gray-600 mt-2">
            Relatórios e histórico detalhado de clientes, veículos e serviços
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-6 shadow-lg">
              <HistoryIcon className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo em Desenvolvimento
            </h2>
            
            <p className="text-gray-600 mb-6">
              O sistema de histórico completo está sendo desenvolvido e será disponibilizado em uma próxima atualização.
            </p>
            
            <div className="bg-white border border-purple-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-start">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-4 mt-0.5">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Funcionalidades Planejadas:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Histórico completo por cliente
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Histórico detalhado por veículo
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Relatório de todos os serviços por veículo
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Análise de custos e receitas
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Exportação de relatórios em PDF
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Filtros avançados por período
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3"></div>
                      Gráficos e estatísticas detalhadas
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-yellow-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg mr-4">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Status: Em Desenvolvimento
                  </h4>
                  <p className="text-sm text-gray-600">
                    Este módulo será implementado na próxima versão do sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;