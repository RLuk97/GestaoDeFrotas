import React from 'react';
import { Package, Wrench, AlertTriangle } from 'lucide-react';

const Parts = () => {
  return (
    <div className="h-full bg-gray-50">
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
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-6 shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo em Desenvolvimento
            </h2>
            
            <p className="text-gray-600 mb-6">
              O sistema de gestão de peças está sendo desenvolvido e será disponibilizado em uma próxima atualização.
            </p>
            
            <div className="bg-white border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-start">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-4 mt-0.5">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Funcionalidades Planejadas:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Cadastro de peças com custo e valor de revenda
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Controle de estoque (entrada e saída)
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Consulta rápida de disponibilidade
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Associação de peças aos serviços
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      Relatórios de movimentação
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

export default Parts;