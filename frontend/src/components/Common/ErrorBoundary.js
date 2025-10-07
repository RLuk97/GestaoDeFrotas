import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Logar para diagnóstico sem quebrar a UI em produção
    console.error('Erro capturado pelo ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    // Tentar recuperar: limpar estado e recarregar rota atual
    this.setState({ hasError: false, error: null });
    try {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (_) {
      // ignore
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Algo deu errado</h2>
            <p className="text-sm text-gray-600 mb-4">
              Detectamos um erro inesperado na interface. Você pode tentar recarregar a página.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-primary-700"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;