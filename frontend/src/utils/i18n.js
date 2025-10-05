import { useSettings } from '../context/SettingsContext';

const dictionaries = {
  'pt-BR': {
    settings: {
      title: 'Configurações',
      sections: {
        general: 'Geral',
        navigation: 'Navegação',
        lists: 'Listas',
        activities: 'Atividades',
        appearance: 'Aparência',
        language: 'Idioma'
      },
      general: {
        compactMode: 'Modo compacto',
        topNotifications: 'Mostrar notificações no topo'
      },
      navigation: {
        showFutureModules: 'Mostrar módulos futuros'
      },
      lists: {
        itemsPerPageServices: 'Itens por página (Serviços)'
      },
      activities: {
        dashboardLimit: 'Limite no Dashboard',
        pageLimit: 'Limite na página de Atividades'
      },
      appearance: {
        theme: 'Tema',
        theme_system: 'Sistema',
        theme_light: 'Claro',
        theme_dark: 'Escuro'
      },
      language: {
        label: 'Idioma',
        ptBR: 'Português (Brasil)',
        enUS: 'English (US)'
      },
      actions: {
        restoreDefaults: 'Restaurar padrão',
        save: 'Salvar'
      }
    },
    navigation: {
      dashboard: 'Dashboard',
      clients: 'Clientes',
      vehicles: 'Veículos',
      services: 'Serviços',
      future: {
        financeDashboard: 'Dashboard Financeiro',
        defaultReport: 'Relatório de Inadimplência',
        paymentControl: 'Controle de Pagamentos',
        contractHistory: 'Histórico de Contratos',
        transfers: 'Transferências',
        partialPayments: 'Pagamentos Parciais',
        outstandingBalances: 'Saldos Devedores',
        parts: 'Peças'
      }
    }
  },
  'en-US': {
    settings: {
      title: 'Settings',
      sections: {
        general: 'General',
        navigation: 'Navigation',
        lists: 'Lists',
        activities: 'Activities',
        appearance: 'Appearance',
        language: 'Language'
      },
      general: {
        compactMode: 'Compact mode',
        topNotifications: 'Show notifications at top'
      },
      navigation: {
        showFutureModules: 'Show future modules'
      },
      lists: {
        itemsPerPageServices: 'Items per page (Services)'
      },
      activities: {
        dashboardLimit: 'Dashboard limit',
        pageLimit: 'Activities page limit'
      },
      appearance: {
        theme: 'Theme',
        theme_system: 'System',
        theme_light: 'Light',
        theme_dark: 'Dark'
      },
      language: {
        label: 'Language',
        ptBR: 'Portuguese (Brazil)',
        enUS: 'English (US)'
      },
      actions: {
        restoreDefaults: 'Restore defaults',
        save: 'Save'
      }
    },
    navigation: {
      dashboard: 'Dashboard',
      clients: 'Clients',
      vehicles: 'Vehicles',
      services: 'Services',
      future: {
        financeDashboard: 'Financial Dashboard',
        defaultReport: 'Default Report',
        paymentControl: 'Payment Control',
        contractHistory: 'Contract History',
        transfers: 'Transfers',
        partialPayments: 'Partial Payments',
        outstandingBalances: 'Outstanding Balances',
        parts: 'Parts'
      }
    }
  }
};

export const useI18n = () => {
  const { settings } = useSettings();
  const lang = settings.language || 'pt-BR';
  const dict = dictionaries[lang] || dictionaries['pt-BR'];
  const t = (key) => {
    try {
      return key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), dict) || key;
    } catch (_) {
      return key;
    }
  };
  return { t, lang };
};

export default dictionaries;