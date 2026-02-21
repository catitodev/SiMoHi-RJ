// SiMoHi-RJ - Estado Global com Zustand

import { create } from 'zustand';
import type { SubBaciaHidrografica, Alerta, LogRaciocinio, EstacaoMonitoramento, LeituraSensor } from '@/lib/types';

// ============================================
// Tipos do Estado
// ============================================

interface UsuarioState {
  id: string | null;
  nome: string;
  email: string;
  role: 'CIDADAO' | 'OPERADOR' | 'ADMIN';
  latitude: number | null;
  longitude: number | null;
  subBaciaAtual: SubBaciaHidrografica | null;
  favoritos: Array<{
    id: string;
    nome: string;
    latitude: number;
    longitude: number;
    subBaciaId: string;
  }>;
  setUsuario: (usuario: Partial<UsuarioState>) => void;
  setLocalizacao: (lat: number, lng: number) => void;
  adicionarFavorito: (favorito: UsuarioState['favoritos'][0]) => void;
  removerFavorito: (id: string) => void;
}

interface MonitoramentoState {
  subBaciaSelecionada: SubBaciaHidrografica | null;
  estacoes: EstacaoMonitoramento[];
  leiturasRecentes: Map<string, LeituraSensor>;
  alertasAtivos: Alerta[];
  painelExpandido: boolean;
  modoCidadao: boolean;
  
  setSubBaciaSelecionada: (subBacia: SubBaciaHidrografica | null) => void;
  setEstacoes: (estacoes: EstacaoMonitoramento[]) => void;
  addLeitura: (estacaoId: string, leitura: LeituraSensor) => void;
  setAlertasAtivos: (alertas: Alerta[]) => void;
  togglePainel: () => void;
  toggleModoCidadao: () => void;
}

interface ThinkingLogState {
  logs: LogRaciocinio[];
  processando: boolean;
  etapaAtual: string;
  
  addLog: (log: Omit<LogRaciocinio, 'id' | 'timestamp'>) => void;
  setProcessando: (status: boolean, etapa?: string) => void;
  limparLogs: () => void;
}

interface UIState {
  tema: 'dark' | 'light';
  sidebarAberta: boolean;
  modalAberto: string | null;
  notificacoes: Array<{
    id: string;
    tipo: 'sucesso' | 'erro' | 'alerta' | 'info';
    titulo: string;
    mensagem: string;
    timestamp: Date;
  }>;
  
  toggleSidebar: () => void;
  setModal: (modal: string | null) => void;
  addNotificacao: (notificacao: Omit<UIState['notificacoes'][0], 'id' | 'timestamp'>) => void;
  removerNotificacao: (id: string) => void;
}

interface APIState {
  status: Map<string, {
    status: 'OPERACIONAL' | 'DEGRADADO' | 'OFFLINE';
    ultimaConsulta: Date | null;
    tempoResposta: number | null;
    erros24h: number;
  }>;
  chaves: Map<string, string>;
  
  setStatusAPI: (fonte: string, status: APIState['status'] extends Map<string, infer T> ? T : never) => void;
  setChaveAPI: (fonte: string, chave: string) => void;
}

// ============================================
// Stores
// ============================================

export const useUsuarioStore = create<UsuarioState>((set) => ({
  id: null,
  nome: 'Cidadão',
  email: '',
  role: 'CIDADAO',
  latitude: null,
  longitude: null,
  subBaciaAtual: null,
  favoritos: [],
  
  setUsuario: (usuario) => set((state) => ({ ...state, ...usuario })),
  setLocalizacao: (lat, lng) => set({ latitude: lat, longitude: lng }),
  adicionarFavorito: (favorito) => set((state) => ({ 
    favoritos: [...state.favoritos, favorito] 
  })),
  removerFavorito: (id) => set((state) => ({ 
    favoritos: state.favoritos.filter(f => f.id !== id) 
  })),
}));

// Alertas simulados iniciais
const ALERTAS_INICIAIS: Alerta[] = [
  {
    id: 'alerta-001',
    subBaciaId: 'sb-02',
    tipo: 'ENCHENTE',
    nivel: 'ALERTA_MAXIMO',
    titulo: 'Enchente Iminente - Rio Iguaçu/Sarapuí',
    descricao: 'Nível crítico atingido. Chuva intensa de 65mm nas últimas 6h.',
    recomendacoes: 'EVACUE IMEDIATAMENTE áreas de risco. Ligue 193.',
    scoreConfianca: 94,
    dadosRadar: true,
    dadosSensores: true,
    convergencia: true,
    fontesConfirmadas: ['Alerta Rio', 'INEA', 'CEMADEN'],
    ativo: true,
    inicio: new Date(),
  },
  {
    id: 'alerta-002',
    subBaciaId: 'sb-04',
    tipo: 'ALAGAMENTO',
    nivel: 'ALERTA',
    titulo: 'Risco de Alagamento - Rio Macacu',
    descricao: 'Nível elevado do rio. Chuva moderada contínua.',
    recomendacoes: 'Afaste-se de áreas de risco. Não cruze vias alagadas.',
    scoreConfianca: 78,
    dadosRadar: true,
    dadosSensores: true,
    convergencia: false,
    fontesConfirmadas: ['Alerta Rio', 'INMET'],
    ativo: true,
    inicio: new Date(),
  },
  {
    id: 'alerta-003',
    subBaciaId: 'sb-16',
    tipo: 'ENCHENTE',
    nivel: 'ATENCAO',
    titulo: 'Monitoramento Intensificado - Rio Macaé',
    descricao: 'Condições de atenção. Acompanhar evolução.',
    recomendacoes: 'Fique atento às informações meteorológicas.',
    scoreConfianca: 65,
    dadosRadar: false,
    dadosSensores: true,
    convergencia: false,
    fontesConfirmadas: ['CEMADEN'],
    ativo: true,
    inicio: new Date(),
  },
];

export const useMonitoramentoStore = create<MonitoramentoState>((set) => ({
  subBaciaSelecionada: null,
  estacoes: [],
  leiturasRecentes: new Map(),
  alertasAtivos: ALERTAS_INICIAIS,
  painelExpandido: true,
  modoCidadao: false,
  
  setSubBaciaSelecionada: (subBacia) => set({ subBaciaSelecionada: subBacia }),
  setEstacoes: (estacoes) => set({ estacoes }),
  addLeitura: (estacaoId, leitura) => set((state) => {
    const novasLeituras = new Map(state.leiturasRecentes);
    novasLeituras.set(estacaoId, leitura);
    return { leiturasRecentes: novasLeituras };
  }),
  setAlertasAtivos: (alertas) => set({ alertasAtivos: alertas }),
  togglePainel: () => set((state) => ({ painelExpandido: !state.painelExpandido })),
  toggleModoCidadao: () => set((state) => ({ modoCidadao: !state.modoCidadao })),
}));

export const useThinkingLogStore = create<ThinkingLogState>((set) => ({
  logs: [],
  processando: false,
  etapaAtual: '',
  
  addLog: (log) => set((state) => ({
    logs: [
      { ...log, id: `log-${Date.now()}`, timestamp: new Date() },
      ...state.logs
    ].slice(0, 50),
  })),
  setProcessando: (status, etapa = '') => set({ 
    processando: status, 
    etapaAtual: etapa 
  }),
  limparLogs: () => set({ logs: [] }),
}));

export const useUIStore = create<UIState>((set) => ({
  tema: 'dark',
  sidebarAberta: true,
  modalAberto: null,
  notificacoes: [],
  
  toggleSidebar: () => set((state) => ({ sidebarAberta: !state.sidebarAberta })),
  setModal: (modal) => set({ modalAberto: modal }),
  addNotificacao: (notificacao) => set((state) => ({
    notificacoes: [
      { ...notificacao, id: `notif-${Date.now()}`, timestamp: new Date() },
      ...state.notificacoes
    ].slice(0, 20),
  })),
  removerNotificacao: (id) => set((state) => ({
    notificacoes: state.notificacoes.filter(n => n.id !== id),
  })),
}));

export const useAPIStore = create<APIState>((set) => ({
  status: new Map([
    ['INMET', { status: 'OPERACIONAL', ultimaConsulta: null, tempoResposta: null, erros24h: 0 }],
    ['CEMADEN', { status: 'OPERACIONAL', ultimaConsulta: null, tempoResposta: null, erros24h: 0 }],
    ['INEA', { status: 'OPERACIONAL', ultimaConsulta: null, tempoResposta: null, erros24h: 0 }],
    ['ALERTA_RIO', { status: 'OPERACIONAL', ultimaConsulta: null, tempoResposta: null, erros24h: 0 }],
    ['CPTEC', { status: 'OPERACIONAL', ultimaConsulta: null, tempoResposta: null, erros24h: 0 }],
  ]),
  chaves: new Map(),
  
  setStatusAPI: (fonte, status) => set((state) => {
    const novoStatus = new Map(state.status);
    novoStatus.set(fonte, status);
    return { status: novoStatus };
  }),
  setChaveAPI: (fonte, chave) => set((state) => {
    const novasChaves = new Map(state.chaves);
    novasChaves.set(fonte, chave);
    return { chaves: novasChaves };
  }),
}));

// ============================================
// Hooks Derivados
// ============================================

export const useAlertasPorNivel = () => {
  const alertas = useMonitoramentoStore((state) => state.alertasAtivos);
  
  return {
    atencao: alertas.filter(a => a.nivel === 'ATENCAO'),
    alerta: alertas.filter(a => a.nivel === 'ALERTA'),
    alertaMaximo: alertas.filter(a => a.nivel === 'ALERTA_MAXIMO'),
    total: alertas.length,
  };
};

export const useEstacoesPorSubBacia = (subBaciaId: string) => {
  const estacoes = useMonitoramentoStore((state) => state.estacoes);
  return estacoes.filter(e => e.subBaciaId === subBaciaId);
};

export const useUsuarioNaSubBacia = () => {
  const latitude = useUsuarioStore((state) => state.latitude);
  const longitude = useUsuarioStore((state) => state.longitude);
  const subBaciaAtual = useUsuarioStore((state) => state.subBaciaAtual);
  const alertasAtivos = useMonitoramentoStore((state) => state.alertasAtivos);
  
  return {
    temLocalizacao: latitude !== null && longitude !== null,
    subBaciaAtual,
    alertasLocais: subBaciaAtual 
      ? alertasAtivos.filter(a => a.subBaciaId === subBaciaAtual.id)
      : [],
  };
};
