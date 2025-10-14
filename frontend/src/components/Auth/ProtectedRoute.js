import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Aguarda hidratação do estado de autenticação para evitar redirect precoce
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-primary text-white">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;