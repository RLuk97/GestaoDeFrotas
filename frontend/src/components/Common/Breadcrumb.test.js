import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb (componente)', () => {
  test('retorna null na raiz "/"', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  test('renderiza trilha para /vehicles/123 com labels corretos', () => {
    render(
      <MemoryRouter initialEntries={["/vehicles/123"]}>
        <Breadcrumb />
      </MemoryRouter>
    );

    // Deve mostrar o ícone Home (via role não é trivial, então garantimos labels)
    // Verifica os nomes dos breadcrumbs
    expect(screen.getByText('Veículos')).toBeInTheDocument();
    expect(screen.getByText('Veículo #123')).toBeInTheDocument();
  });

  test('renderiza breadcrumb intermediário como link e último como texto', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/services/55"]}>
        <Breadcrumb />
      </MemoryRouter>
    );

    // Intermediário como link
    const servicesLink = screen.getByText('Serviços');
    expect(servicesLink.tagName.toLowerCase()).toBe('a');

    // Último como span
    const last = screen.getByText('Serviço #55');
    expect(last.tagName.toLowerCase()).toBe('span');
  });
});