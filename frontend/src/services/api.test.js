import ApiService from './api';

describe('ApiService.request', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('retorna dados JSON quando a resposta é OK e application/json', async () => {
    const mockData = { hello: 'world' };
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' },
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await ApiService.request('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/test'), expect.any(Object));
  });

  test('lança erro com mensagem da API quando a resposta não é OK (JSON)', async () => {
    const mockError = { message: 'Falha ao processar' };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: { get: () => 'application/json' },
      json: jest.fn().mockResolvedValue(mockError),
    });

    await expect(ApiService.request('/fail')).rejects.toThrow('Falha ao processar');
    expect(global.fetch).toHaveBeenCalled();
  });

  test('retorna texto quando a resposta é OK e não-JSON', async () => {
    const mockText = 'OK TEXT';
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'text/html' },
      text: jest.fn().mockResolvedValue(mockText),
    });

    const result = await ApiService.request('/text');
    expect(result).toEqual(mockText);
  });
});