// Em desenvolvimento, prefira usar o proxy do dev server
// para evitar CORS: base relativa '/api'. Em produção,
// REACT_APP_API_URL deve apontar para o backend absoluto.
const isProd = process.env.NODE_ENV === 'production';
const API_BASE_URL = (() => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl;
  if (isProd) {
    // Ajuda de diagnóstico em produção quando a URL não está configurada
    // Isso evita o erro genérico e orienta a configuração correta no Vercel.
    // A base '/api' no Vercel normalmente resultará em "Service Unavailable".
    // Configure REACT_APP_API_URL para o backend (ex.: https://<app>.up.railway.app/api).
    // Mantemos '/api' como fallback para não quebrar o app, mas emitimos alerta.
    // eslint-disable-next-line no-console
    console.warn('[ApiService] REACT_APP_API_URL não definido em produção. Configure a URL do backend (ex.: https://<app>.up.railway.app/api).');
  }
  // Desenvolvimento: usar alvo absoluto para evitar problemas de proxy
  // Isso garante que as chamadas batam diretamente no backend local.
  return 'http://localhost:5000/api';
})();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    // Log de diagnóstico em desenvolvimento para verificar URL efetiva
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.debug('[ApiService] URL:', url);
    }
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 10000; // timeout gentil para evitar hangs
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Resposta não-JSON (ex.: HTML de proxy/servidor indisponível)
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}${text ? ` - ${text}` : ''}`);
        }
        // Retornar texto quando for OK e não-JSON (casos raros)
        return text;
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      // Normaliza mensagens para casos comuns em produção (Vercel sem backend configurado)
      const isAbort = error.name === 'AbortError';
      const baseMsg = isAbort ? 'Tempo de resposta excedido' : (error.message || 'Falha na requisição');
      const hint = isProd && !process.env.REACT_APP_API_URL
        ? 'Backend não acessível. Defina REACT_APP_API_URL no Vercel para apontar para seu backend (ex.: https://<app>.up.railway.app/api).'
        : '';
      const normalized = `${baseMsg}${hint ? ` — ${hint}` : ''}`;
      // eslint-disable-next-line no-console
      console.error(`Erro na API (${endpoint}):`, normalized);
      throw new Error(normalized);
    }
  }

  // Métodos para Clientes
  async getClients() {
    console.log('ApiService.getClients() - Fazendo requisição...');
    const response = await this.request('/clients');
    console.log('ApiService.getClients() - Resposta recebida:', response);
    return response.data || response;
  }

  async getClientById(id) {
    const response = await this.request(`/clients/${id}`);
    return response.data || response;
  }

  async createClient(clientData) {
    return this.request('/clients', {
      method: 'POST',
      body: clientData,
    });
  }

  async updateClient(id, clientData) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: clientData,
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Veículos
  async getVehicles() {
    console.log('ApiService.getVehicles() - Fazendo requisição...');
    const response = await this.request('/vehicles');
    console.log('ApiService.getVehicles() - Resposta recebida:', response);
    return response.data || response;
  }

  async getVehicleById(id) {
    const response = await this.request(`/vehicles/${id}`);
    return response.data || response;
  }

  async createVehicle(vehicleData) {
    return this.request('/vehicles', {
      method: 'POST',
      body: vehicleData,
    });
  }

  async updateVehicle(id, vehicleData) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: vehicleData,
    });
  }

  async deleteVehicle(id) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Serviços
  async getServices() {
    console.log('ApiService.getServices() - Fazendo requisição...');
    const response = await this.request('/services');
    console.log('ApiService.getServices() - Resposta recebida:', response);
    return response.data || response;
  }

  async getServiceById(id) {
    const response = await this.request(`/services/${id}`);
    return response.data || response;
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: serviceData,
    });
  }

  async updateService(id, serviceData) {
    console.log('=== ApiService.updateService ===');
    console.log('ID:', id);
    console.log('serviceData:', serviceData);
    
    const result = await this.request(`/services/${id}`, {
      method: 'PUT',
      body: serviceData,
    });
    
    console.log('Resultado da API:', result);
    return result;
  }

  async updateServiceStatus(id, paymentStatus) {
    console.log('=== ApiService.updateServiceStatus ===');
    console.log('ID:', id);
    console.log('paymentStatus:', paymentStatus);
    
    const result = await this.request(`/services/${id}/status`, {
      method: 'PATCH',
      body: { paymentStatus },
    });
    
    console.log('Resultado da API:', result);
    return result;
  }

  async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Atividades
  async getRecentActivities(limit = 5) {
    const response = await this.request(`/activities/recent?limit=${limit}`);
    return response.data || response;
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();