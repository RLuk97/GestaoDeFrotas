import React, { useState, useEffect } from 'react';

const ClientForm = ({ client, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        status: client.status || 'active',
        notes: client.notes || ''
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone é opcional
    if (formData.phone && formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
        newErrors.phone = 'Telefone deve conter DDD + número com 10 ou 11 dígitos';
      }
    }

    if (!formData.document.trim()) {
      newErrors.document = 'CPF/CNPJ é obrigatório';
    } else {
      const digits = formData.document.replace(/\D/g, '');
      if (digits.length !== 11 && digits.length !== 14) {
        newErrors.document = 'Informe CPF com 11 dígitos ou CNPJ com 14 dígitos';
      }
    }

    // Endereço, cidade e estado são opcionais

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value) => {
    // Remove tudo que não é dígito e limita a 11 dígitos
    const cleaned = value.replace(/\D/g, '').slice(0, 11);

    // Formato fixo: (XX) XXXX-XXXX quando houver até 10 dígitos
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Formato celular: (XX) XXXXX-XXXX para 11 dígitos
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // formatPhone duplicado removido (utilizar a versão acima que suporta 10/11 dígitos)

  const formatDocument = (value) => {
    // Remove tudo que não é dígito e limita a 14 dígitos
    let cleaned = value.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 14);

    // CPF: XXX.XXX.XXX-XX (até 11 dígitos)
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (match, p1, p2, p3, p4) => {
        let out = p1;
        if (p2) out += '.' + p2;
        if (p3) out += '.' + p3;
        if (p4) out += '-' + p4;
        return out;
      });
    }

    // CNPJ: XX.XXX.XXX/XXXX-XX (14 dígitos)
    return cleaned.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (match, p1, p2, p3, p4, p5) => {
      let out = p1;
      if (p2) out += '.' + p2;
      if (p3) out += '.' + p3;
      if (p4) out += '/' + p4;
      if (p5) out += '-' + p5;
      return out;
    });
  };

  const formatZipCode = (value) => {
    // Remove tudo que não é dígito
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // handlePhoneChange duplicado removido (utilizar a versão acima que limpa erros)

  const handleDocumentChange = (e) => {
    const formatted = formatDocument(e.target.value);
    setFormData(prev => ({ ...prev, document: formatted }));

    if (errors.document) {
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleZipCodeChange = (e) => {
    const formatted = formatZipCode(e.target.value);
    setFormData(prev => ({ ...prev, zipCode: formatted }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-brand-primary mb-1">
          Nome Completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Digite o nome completo"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email e Telefone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brand-primary mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="email@exemplo.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-brand-primary mb-1">
            Telefone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
            maxLength="15"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* CPF/CNPJ */}
      <div>
        <label htmlFor="document" className="block text-sm font-semibold text-brand-primary mb-1">
          CPF/CNPJ *
        </label>
        <input
          type="text"
          id="document"
          name="document"
          value={formData.document}
          onChange={handleDocumentChange}
          className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
            errors.document ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          maxLength="18"
        />
        {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
      </div>

      {/* Endereço */}
      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-brand-primary mb-1">
          Endereço
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Rua, número, complemento"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* Cidade, Estado e CEP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-brand-primary mb-1">
            Cidade
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="São Paulo"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-brand-primary mb-1">
            Estado
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`select-light w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white text-gray-900 ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-semibold text-brand-primary mb-1">
            CEP
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleZipCodeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="00000-000"
            maxLength="9"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-semibold text-brand-primary mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={!client}
          className={`select-light w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white text-gray-900 ${!client ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
        {!client && (
          <p className="text-xs text-gray-500 mt-1">
            Novos clientes iniciam como <span className="font-semibold">Ativo</span>. Para alterar, edite o cliente.
          </p>
        )}
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-brand-primary mb-1">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          placeholder="Informações adicionais sobre o cliente..."
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {client ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;