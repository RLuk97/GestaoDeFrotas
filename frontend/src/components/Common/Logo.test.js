import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo (componente)', () => {
  test('renderiza imagem e texto por padrão', () => {
    render(<Logo />);
    const img = screen.getByAltText('GestFrota Logo');
    expect(img).toBeInTheDocument();
    expect(screen.getByText('Gest')).toBeInTheDocument();
    expect(screen.getByText('Frota')).toBeInTheDocument();
  });

  test('oculta texto quando showText=false', () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText('Gest')).toBeNull();
    expect(screen.queryByText('Frota')).toBeNull();
  });
});