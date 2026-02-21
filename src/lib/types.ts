// SiMoHi-RJ - Tipos TypeScript

// ============================================
// Geografia
// ============================================

export interface MacrorregiaoAmbiental {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  areaKm2: number;
  coordenadas?: GeoJSON;
  subBacias: SubBaciaHidrografica[];
}

export interface SubBaciaHidrografica {
  id: string;
  codigo: string;
  nome: string;
  areaKm2: number;
  coordenadas?: GeoJSON;
  macrorregiaoId: string;
  macrorregiao?: MacrorregiaoAmbiental;
  rioPrincipal: string;
  populacaoEstimada: number;
  nivelRiscoMedio: NivelRisco;
}

export interface GeoJSON {
  type: string;
  coordinates: number[][][] | number[];
}

// ============================================
// Monitoramento
// ============================================

export type TipoEstacao = 'PLUVIOMETRICO' | 'FLUVIOMETRICO' | 'METEOROLOGICO' | 'RADAR';
export type FonteEstacao = 'INMET' | 'CEMADEN' | 'INEA' | 'ALERTA_RIO' | 'CPTEC';

export interface EstacaoMonitoramento {
  id: string;
  codigo: string;
  nome: string;
  tipo: TipoEstacao;
  fonte: FonteEstacao;
  latitude: number;
  longitude: number;
  altitude?: number;
  subBaciaId: string;
  ativa: boolean;
  ultimaLeitura?: Date;
  subBacia?: SubBaciaHidrografica;
}

export interface LeituraSensor {
  id: string;
  estacaoId: string;
  timestamp: Date;
  chuvaAtual?: number;
  chuvaAcumulada1h?: number;
  chuvaAcumulada24h?: number;
  nivelRio?: number;
  vazao?: number;
  temperatura?: number;
  umidade?: number;
  pressao?: number;
  ventoVelocidade?: number;
  ventoDirecao?: number;
  reflectividade?: number;
  estimativaChuva?: number;
  fonte: string;
  estacao?: EstacaoMonitoramento;
}

// ============================================
// Alertas
// ============================================

export type TipoAlerta = 'ENCHENTE' | 'ALAGAMENTO' | 'DESLIZAMENTO' | 'SECA';
export type NivelAlerta = 'ATENCAO' | 'ALERTA' | 'ALERTA_MAXIMO';
export type NivelRisco = 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO';

export interface Alerta {
  id: string;
  subBaciaId: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  descricao: string;
  recomendacoes: string;
  scoreConfianca: number;
  dadosRadar: boolean;
  dadosSensores: boolean;
  convergencia: boolean;
  fontesConfirmadas: string[];
  ativo: boolean;
  inicio: Date;
  fim?: Date;
  subBacia?: SubBaciaHidrografica;
}

// ============================================
// Log de Raciocínio
// ============================================

export type EtapaRaciocinio = 'ANALISE' | 'VERIFICACAO' | 'CONVERGENCIA' | 'CONCLUSAO';

export interface LogRaciocinio {
  id: string;
  alertaId?: string;
  subBaciaId?: string;
  timestamp: Date;
  etapa: EtapaRaciocinio;
  mensagem: string;
  dados?: Record<string, unknown>;
}

// ============================================
// Usuário
// ============================================

export type RoleUsuario = 'CIDADAO' | 'OPERADOR' | 'ADMIN';
export type NivelNotificacao = 'HIPERLOCAL' | 'LOCAL' | 'BIORREGIONAL';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  role: RoleUsuario;
  latitude?: number;
  longitude?: number;
  subBaciaAtual?: string;
  notificacoesAtivas: boolean;
  nivelNotificacao: NivelNotificacao;
  favoritos: LocalidadeFavorita[];
}

export interface LocalidadeFavorita {
  id: string;
  usuarioId: string;
  subBaciaId: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco?: string;
  principal: boolean;
}

// ============================================
// Status API
// ============================================

export type StatusApiEstado = 'OPERACIONAL' | 'DEGRADADO' | 'OFFLINE';

export interface StatusApi {
  fonte: FonteEstacao;
  status: StatusApiEstado;
  ultimaConsulta?: Date;
  tempoResposta?: number;
  erros24h: number;
  requisicoes24h: number;
  mensagem?: string;
}

// ============================================
// APIs Response Types
// ============================================

export interface INMETEstacaoResponse {
  codigo: string;
  nome: string;
  latitude: number;
  longitude: number;
  dados: INMETDadoResponse[];
}

export interface INMETDadoResponse {
  data: string;
  hora: string;
  temperatura: number;
  umidade: number;
  pressao: number;
  ventoVelocidade: number;
  ventoDirecao: number;
  chuva: number;
}

export interface CEMADENEstacaoResponse {
  codigo: string;
  nome: string;
  latitude: number;
  longitude: number;
  nivel: number;
  chuva: number;
  timestamp: string;
}

export interface INEAAlertaResponse {
  estacao: string;
  rio: string;
  nivelAtual: number;
  nivelAlerta: number;
  nivelTransbordamento: number;
  timestamp: string;
}

export interface AlertaRioResponse {
  estacao: string;
  chuva15min: number;
  chuva1h: number;
  chuva24h: number;
  timestamp: string;
}

export interface CPTECSateliteResponse {
  url: string;
  timestamp: string;
  tipo: string;
}

// ============================================
// Map Types
// ============================================

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  tipo: 'estacao' | 'alerta' | 'usuario';
  nivel?: NivelRisco;
  dados?: Record<string, unknown>;
}

export interface MapCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: MapMarker[];
}

// ============================================
// Chart Types
// ============================================

export interface SerieTemporal {
  timestamp: Date;
  valor: number;
}

export interface ChartDataPoint {
  timestamp: string;
  nivelRio?: number;
  chuvaAcumulada?: number;
  temperatura?: number;
  umidade?: number;
}
