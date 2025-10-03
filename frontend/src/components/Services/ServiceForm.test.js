import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceForm from './ServiceForm';
import * as AppContextModule from '../../context/AppContext';

describe('ServiceForm (componente)', () => {
  beforeEach(() => {
    jest.spyOn(AppContextModule, 'useApp').mockReturnValue({
      state: {
        vehicles: [
          { id: '1', license_plate: 'ABC-1234', brand: 'Ford', model: 'Fiesta', client_id: 10 },
          { id: '2', license_plate: 'XYZ-9876', brand: 'VW', model: 'Golf', client_id: 20 },
        ],
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exibe erros de validação para campos obrigatórios', () => {
    const onSubmit = jest.fn();

    render(<ServiceForm onSubmit={onSubmit} onCancel={() => {}} />);

    // Sem selecionar nada, clicar em enviar
    const submitBtn = screen.getByRole('button', { name: /registrar serviço/i });
    fireEvent.click(submitBtn);

    // Erros esperados (entryDate tem default, então não deve acusar)
    expect(screen.getByText('Veículo é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Pelo menos um tipo de serviço é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Quilometragem é obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Valor total é obrigatório')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('selecionar "Outro" sem customType exibe erro e com customType corrige', () => {
    render(<ServiceForm onSubmit={() => {}} onCancel={() => {}} />);

    // Selecionar "Outro"
    const outroLabel = screen.getByText('Outro');
    const outroCheckbox = outroLabel.previousSibling; // input
    fireEvent.click(outroCheckbox);

    // Deve exibir campo customType e erro por não preenchido
    expect(screen.getByLabelText('Especifique o Tipo de Serviço *')).toBeInTheDocument();
    // Disparar validação
    const submitBtn = screen.getByRole('button', { name: /registrar serviço/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText('Especifique o tipo de serviço personalizado')).toBeInTheDocument();

    // Preencher customType remove erro
    const customTypeInput = screen.getByLabelText('Especifique o Tipo de Serviço *');
    fireEvent.change(customTypeInput, { target: { value: 'Pintura Especial' } });
    // Simular toggle em um campo para limpar o erro
    fireEvent.change(customTypeInput, { target: { value: 'Pintura Especial' } });
    expect(screen.queryByText('Especifique o tipo de serviço personalizado')).toBeNull();
  });

  test('envia payload correto ao submeter com dados válidos', () => {
    const onSubmit = jest.fn();
    render(<ServiceForm onSubmit={onSubmit} onCancel={() => {}} preselectedVehicleId={'1'} />);

    // Selecionar tipos: "Troca de Óleo" e "Outro" com customType
    const tipoTroca = screen.getByText('Troca de Óleo');
    fireEvent.click(tipoTroca.previousSibling);
    const outroLabel = screen.getByText('Outro');
    fireEvent.click(outroLabel.previousSibling);
    const customTypeInput = screen.getByLabelText('Especifique o Tipo de Serviço *');
    fireEvent.change(customTypeInput, { target: { value: 'Pintura Especial' } });

    // Preencher descrição, datas, quilometragem e valor
    fireEvent.change(screen.getByLabelText('Descrição do Serviço *'), { target: { value: 'Serviço completo' } });
    fireEvent.change(screen.getByLabelText('Data de Entrada *'), { target: { value: '2024-01-10' } });
    fireEvent.change(screen.getByLabelText('Quilometragem (km) *'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('Valor Total do Serviço (R$) *'), { target: { value: '350.50' } });

    // Submeter
    const submitBtn = screen.getByRole('button', { name: /registrar serviço/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];

    // Valida campos principais do payload
    expect(payload.vehicle_id).toBe('1');
    expect(payload.client_id).toBe(10);
    expect(payload.service_type).toEqual(expect.arrayContaining(['Troca de Óleo', 'Pintura Especial']));
    expect(payload.service_type).not.toContain('Outro');
    expect(payload.description).toBe('Serviço completo');
    expect(payload.cost).toBeCloseTo(350.5);
    expect(payload.service_date).toBe('2024-01-10');
    expect(payload.mileage).toBe(12345);
    // exit_date permanece null quando não preenchido
    expect(payload.exit_date).toBeNull();
  });
});