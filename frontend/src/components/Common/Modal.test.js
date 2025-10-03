import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal (componente)', () => {
  test('não renderiza quando isOpen=false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Título">
        <div>Conteúdo</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  test('renderiza título e conteúdo quando isOpen=true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Meu Modal">
        <div>Conteúdo do modal</div>
      </Modal>
    );

    expect(screen.getByText('Meu Modal')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  test('fecha ao pressionar Escape e ao clicar no overlay', async () => {
    const onClose = jest.fn();

    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Fechar">
        <div>Body</div>
      </Modal>
    );

    // Pressionar Escape deve chamar onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    // Clicar no overlay (div com background gradiente) deve chamar onClose
    const overlays = container.querySelectorAll('div.fixed.inset-0');
    const overlay = overlays.length > 1 ? overlays[1] : overlays[0];
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(2);
    }
  });

  test('controla overflow do body ao abrir/fechar', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Overflow">
        <div>Body</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Overflow">
        <div>Body</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });
});