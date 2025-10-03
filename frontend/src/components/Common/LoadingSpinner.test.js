import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner (componente)', () => {
  test('renderiza texto padrão e spinner com tamanho md', () => {
    const { container } = render(<LoadingSpinner />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    const cls = svg.getAttribute('class') || '';
    expect(cls).toMatch(/h-6 w-6/);
    expect(cls).toMatch(/animate-spin/);
  });

  test('aceita tamanho grande e texto customizado', () => {
    const { container } = render(<LoadingSpinner size="lg" text="Processando" />);
    expect(screen.getByText('Processando')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    const cls = svg.getAttribute('class') || '';
    expect(cls).toMatch(/h-8 w-8/);
  });
});