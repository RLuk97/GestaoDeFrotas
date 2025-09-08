import React from 'react';
import { History as HistoryIcon, FileText, AlertTriangle } from 'lucide-react';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 mb-6">
              <HistoryIcon className="h-12 w-12 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo em Desenvolvimento
            </h2>
            
            <p className="text-gray-600 mb-6">
              O sistema de histórico completo está sendo desenvolvido e será disponibilizado em uma próxima atualização.
            </p>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">
                    Funcionalidades Planejadas:
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Histórico completo por cliente</li>
                    <li>• Histórico detalhado por veículo</li>
                    <li>• Relatório de todos os serviços por veículo</li>
                    <li>• Análise de custos e receitas</li>
                    <li>• Exportação de relatórios em PDF</li>
                    <li>• Filtros avançados por período</li>
                    <li>• Gráficos e estatísticas detalhadas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Status: Em Desenvolvimento
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
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