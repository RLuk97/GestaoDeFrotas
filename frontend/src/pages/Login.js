import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Removido Logo do formulário para atender solicitação de retirar o ícone da parte de login

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(username.trim(), password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Falha ao entrar');
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-brand-primary text-white">
      {/* Coluna esquerda: formulário centralizado */}
      <div className="relative flex items-center justify-center p-6 md:p-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-brand-primary to-slate-950" />
        </div>

        <div className="relative w-full max-w-sm text-center px-2 sm:px-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Faça seu login<span className="text-primary-500">.</span>
          </h1>
          <p className="text-sm text-primary-100 mb-8">Acesse o sistema de Gestão de Frotas</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-2 text-left">E-mail</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                  <Mail className="h-4 w-4 text-primary-200" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="E-mail ou usuário"
                  className="w-full input-light pl-10 bg-slate-900/60 text-slate-200 placeholder-slate-500 border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-100 mb-2 text-left">Senha</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center">
                  <Lock className="h-4 w-4 text-primary-200" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full input-light pl-10 bg-slate-900/60 text-slate-200 placeholder-slate-500 border-slate-800"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:opacity-95 transition-opacity"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Coluna direita: painel visual com conteúdo centralizado */}
      <div className="hidden md:flex relative items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-slate-800 to-brand-primary" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-700 via-primary-600 to-slate-800" />
        <div className="relative flex flex-col items-center text-center">
          <Gauge className="h-16 w-16 text-primary-300 mb-3" />
          <p className="text-xl md:text-1xl lg:text-2xl font-bold text-primary-100">Bem-vindo</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-black">Gest</span>
            <span className="text-red-500">Frota</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Login;