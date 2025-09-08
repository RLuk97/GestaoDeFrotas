import React from 'react';
import { Package, Wrench, AlertTriangle } from 'lucide-react';

const Parts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Peças</h1>
          <p className="text-gray-600 mt-2">
            Controle de estoque e gerenciamento de peças automotivas
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
              <Package className="h-12 w-12 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo em Desenvolvimento
            </h2>
            
            <p className="text-gray-600 mb-6">
              O sistema de gestão de peças está sendo desenvolvido e será disponibilizado em uma próxima atualização.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Funcionalidades Planejadas:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Cadastro de peças com custo e valor de revenda</li>
                    <li>• Controle de estoque (entrada e saída)</li>
                    <li>• Consulta rápida de disponibilidade</li>
                    <li>• Associação de peças aos serviços</li>
                    <li>• Relatórios de movimentação</li>
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

export default Parts;