import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageHeader from './PageHeader';
import * as NotificationModule from '../../context/NotificationContext';

describe('PageHeader (componente)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renderiza título e subtítulo, sem busca por padrão', () => {
    jest.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<PageHeader title="Página" subtitle="Subtítulo" />);

    expect(screen.getByText('Página')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Pesquisar...')).toBeNull();
  });

  test('exibe barra de busca quando showSearch=true', () => {
    jest.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<PageHeader title="Busca" showSearch={true} />);
    expect(screen.getByPlaceholderText('Pesquisar...')).toBeInTheDocument();
  });

  test('badge de não lidas e marcar todas como lidas ao abrir dropdown', async () => {
    const markAllAsRead = jest.fn();
    jest.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      notifications: [
        { id: 1, title: 'Teste', message: 'Mensagem', time: 'Agora', unread: true, icon: () => null, color: '', bgColor: '' },
      ],
      unreadCount: 1,
      markAsRead: jest.fn(),
      markAllAsRead,
    });

    render(<PageHeader title="Notificações" showNotifications={true} />);

    // Badge com contador visível
    expect(screen.getByText('1')).toBeInTheDocument();

    // Abrir dropdown deve chamar markAllAsRead quando há não lidas
    const badge = screen.getByText('1');
    const bellButton = badge.closest('button');
    if (!bellButton) throw new Error('Botão de notificações não encontrado');
    fireEvent.click(bellButton);
    expect(markAllAsRead).toHaveBeenCalledTimes(1);

    // Com dropdown aberto, deve mostrar lista de notificações
    expect(await screen.findByText('Teste')).toBeInTheDocument();
  });

  test('clicar em uma notificação chama markAsRead com o id', async () => {
    const markAsRead = jest.fn();
    jest.spyOn(NotificationModule, 'useNotifications').mockReturnValue({
      notifications: [
        { id: 42, title: 'Alerta', message: 'Algo aconteceu', time: 'Agora', unread: true, icon: () => null, color: '', bgColor: '' },
      ],
      unreadCount: 1,
      markAsRead,
      markAllAsRead: jest.fn(),
    });

    render(<PageHeader title="Notificações" showNotifications={true} />);

    // Abrir dropdown
    const badge = screen.getByText('1');
    const bellButton = badge.closest('button');
    if (!bellButton) throw new Error('Botão de notificações não encontrado');
    fireEvent.click(bellButton);

    // Clicar no item (usa onClick no container da notificação)
    const item = await screen.findByText('Alerta');
    fireEvent.click(item);
    expect(markAsRead).toHaveBeenCalledWith(42);
  });
});