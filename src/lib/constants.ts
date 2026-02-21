// SiMoHi-RJ - Constantes Geográficas
// 7 Macrorregiões Ambientais (MRA) e 30 Sub-bacias Hidrográficas
// Fonte: SEMADS/INEA - Plano Estadual de Recursos Hídricos

import type { MacrorregiaoAmbiental, SubBaciaHidrografica, NivelRisco } from './types';

// ============================================
// MACRORREGIÕES AMBIENTAIS DO RIO DE JANEIRO
// ============================================

export const MACRORREGIOES: MacrorregiaoAmbiental[] = [
  {
    id: 'mra-1',
    codigo: 'MRA-1',
    nome: 'Baía de Guanabara',
    descricao: 'Região da Baía de Guanabara, incluindo as bacias dos rios que a ela convergem. Área metropolitana do Rio de Janeiro.',
    areaKm2: 4125,
    subBacias: [],
  },
  {
    id: 'mra-2',
    codigo: 'MRA-2',
    nome: 'Baía de Sepetiba',
    descricao: 'Região da Baía de Sepetiba e bacias hidrográficas adjacentes. Inclui municípios da costa oeste fluminense.',
    areaKm2: 2650,
    subBacias: [],
  },
  {
    id: 'mra-3',
    codigo: 'MRA-3',
    nome: 'Litoral Norte',
    descricao: 'Região do litoral norte fluminense, desde Macaé até a divisa com o Espírito Santo.',
    areaKm2: 3100,
    subBacias: [],
  },
  {
    id: 'mra-4',
    codigo: 'MRA-4',
    nome: 'Serrana',
    descricao: 'Região serrana do estado, incluindo as bacias dos rios que nascem na Serra do Mar.',
    areaKm2: 4200,
    subBacias: [],
  },
  {
    id: 'mra-5',
    codigo: 'MRA-5',
    nome: 'Baixadas Litorâneas',
    descricao: 'Região das baixadas litorâneas, incluindo as bacias do Rio Macaé e Rio das Ostras.',
    areaKm2: 5800,
    subBacias: [],
  },
  {
    id: 'mra-6',
    codigo: 'MRA-6',
    nome: 'Vale do Paraíba',
    descricao: 'Bacia do Rio Paraíba do Sul, principal rio do estado, incluindo seus afluentes.',
    areaKm2: 14200,
    subBacias: [],
  },
  {
    id: 'mra-7',
    codigo: 'MRA-7',
    nome: 'Noroeste Fluminense',
    descricao: 'Região noroeste do estado, incluindo bacias do médio Paraíba e afluentes.',
    areaKm2: 8900,
    subBacias: [],
  },
];

// ============================================
// SUB-BACIAS HIDROGRÁFICAS DO RIO DE JANEIRO
// ============================================

export const SUB_BACIAS: SubBaciaHidrografica[] = [
  // MRA-1: Baía de Guanabara
  {
    id: 'sb-01',
    codigo: 'RJ-01',
    nome: 'Rio Guandu',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Guandu',
    areaKm2: 1480,
    populacaoEstimada: 850000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-02',
    codigo: 'RJ-02',
    nome: 'Rio Iguaçu/Sarapuí',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Iguaçu',
    areaKm2: 1150,
    populacaoEstimada: 1200000,
    nivelRiscoMedio: 'ALTO',
  },
  {
    id: 'sb-03',
    codigo: 'RJ-03',
    nome: 'Rio Meriti/Acari',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Meriti',
    areaKm2: 420,
    populacaoEstimada: 950000,
    nivelRiscoMedio: 'ALTO',
  },
  {
    id: 'sb-04',
    codigo: 'RJ-04',
    nome: 'Rio Macacu/Guapiaçu',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Macacu',
    areaKm2: 980,
    populacaoEstimada: 320000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-05',
    codigo: 'RJ-05',
    nome: 'Rio Caceribu/Iguaçu',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Caceribu',
    areaKm2: 760,
    populacaoEstimada: 480000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-06',
    codigo: 'RJ-06',
    nome: 'Rio Magé/Saracuruna',
    macrorregiaoId: 'mra-1',
    rioPrincipal: 'Rio Magé',
    areaKm2: 540,
    populacaoEstimada: 380000,
    nivelRiscoMedio: 'MODERADO',
  },

  // MRA-2: Baía de Sepetiba
  {
    id: 'sb-07',
    codigo: 'RJ-07',
    nome: 'Rio Guandu/Santa Cruz',
    macrorregiaoId: 'mra-2',
    rioPrincipal: 'Rio Guandu',
    areaKm2: 850,
    populacaoEstimada: 420000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-08',
    codigo: 'RJ-08',
    nome: 'Rio Piracão/Mendes',
    macrorregiaoId: 'mra-2',
    rioPrincipal: 'Rio Piracão',
    areaKm2: 380,
    populacaoEstimada: 85000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-09',
    codigo: 'RJ-09',
    nome: 'Rio Piraquê/Maricá',
    macrorregiaoId: 'mra-2',
    rioPrincipal: 'Rio Piraquê',
    areaKm2: 290,
    populacaoEstimada: 150000,
    nivelRiscoMedio: 'BAIXO',
  },

  // MRA-3: Litoral Norte
  {
    id: 'sb-10',
    codigo: 'RJ-10',
    nome: 'Rio Macabu',
    macrorregiaoId: 'mra-3',
    rioPrincipal: 'Rio Macabu',
    areaKm2: 720,
    populacaoEstimada: 125000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-11',
    codigo: 'RJ-11',
    nome: 'Rio São João',
    macrorregiaoId: 'mra-3',
    rioPrincipal: 'Rio São João',
    areaKm2: 1680,
    populacaoEstimada: 180000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-12',
    codigo: 'RJ-12',
    nome: 'Rio Itabapoana',
    macrorregiaoId: 'mra-3',
    rioPrincipal: 'Rio Itabapoana',
    areaKm2: 2340,
    populacaoEstimada: 210000,
    nivelRiscoMedio: 'MODERADO',
  },

  // MRA-4: Serrana
  {
    id: 'sb-13',
    codigo: 'RJ-13',
    nome: 'Rio Piabanha',
    macrorregiaoId: 'mra-4',
    rioPrincipal: 'Rio Piabanha',
    areaKm2: 420,
    populacaoEstimada: 180000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-14',
    codigo: 'RJ-14',
    nome: 'Rio Preto',
    macrorregiaoId: 'mra-4',
    rioPrincipal: 'Rio Preto',
    areaKm2: 680,
    populacaoEstimada: 95000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-15',
    codigo: 'RJ-15',
    nome: 'Rio Bonito/Aldeia',
    macrorregiaoId: 'mra-4',
    rioPrincipal: 'Rio Bonito',
    areaKm2: 380,
    populacaoEstimada: 72000,
    nivelRiscoMedio: 'BAIXO',
  },

  // MRA-5: Baixadas Litorâneas
  {
    id: 'sb-16',
    codigo: 'RJ-16',
    nome: 'Rio Macaé',
    macrorregiaoId: 'mra-5',
    rioPrincipal: 'Rio Macaé',
    areaKm2: 1260,
    populacaoEstimada: 280000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-17',
    codigo: 'RJ-17',
    nome: 'Rio das Ostras',
    macrorregiaoId: 'mra-5',
    rioPrincipal: 'Rio das Ostras',
    areaKm2: 480,
    populacaoEstimada: 185000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-18',
    codigo: 'RJ-18',
    nome: 'Rio Una',
    macrorregiaoId: 'mra-5',
    rioPrincipal: 'Rio Una',
    areaKm2: 520,
    populacaoEstimada: 95000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-19',
    codigo: 'RJ-19',
    nome: 'Lagunas de Araruama',
    macrorregiaoId: 'mra-5',
    rioPrincipal: 'Canal de Itajuru',
    areaKm2: 620,
    populacaoEstimada: 320000,
    nivelRiscoMedio: 'BAIXO',
  },

  // MRA-6: Vale do Paraíba
  {
    id: 'sb-20',
    codigo: 'RJ-20',
    nome: 'Paraíba do Sul - Alto Curso',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Paraíba do Sul',
    areaKm2: 3200,
    populacaoEstimada: 680000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-21',
    codigo: 'RJ-21',
    nome: 'Rio Paraibuna',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Paraibuna',
    areaKm2: 1180,
    populacaoEstimada: 125000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-22',
    codigo: 'RJ-22',
    nome: 'Rio Pomba',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Pomba',
    areaKm2: 2150,
    populacaoEstimada: 185000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-23',
    codigo: 'RJ-23',
    nome: 'Rio Muriaé',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Muriaé',
    areaKm2: 1580,
    populacaoEstimada: 145000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-24',
    codigo: 'RJ-24',
    nome: 'Paraíba do Sul - Médio Curso',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Paraíba do Sul',
    areaKm2: 2800,
    populacaoEstimada: 520000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-25',
    codigo: 'RJ-25',
    nome: 'Rio Dois Rios',
    macrorregiaoId: 'mra-6',
    rioPrincipal: 'Rio Dois Rios',
    areaKm2: 920,
    populacaoEstimada: 78000,
    nivelRiscoMedio: 'BAIXO',
  },

  // MRA-7: Noroeste Fluminense
  {
    id: 'sb-26',
    codigo: 'RJ-26',
    nome: 'Rio Carangola',
    macrorregiaoId: 'mra-7',
    rioPrincipal: 'Rio Carangola',
    areaKm2: 850,
    populacaoEstimada: 68000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-27',
    codigo: 'RJ-27',
    nome: 'Rio Itaperuna',
    macrorregiaoId: 'mra-7',
    rioPrincipal: 'Rio Itaperuna',
    areaKm2: 720,
    populacaoEstimada: 125000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-28',
    codigo: 'RJ-28',
    nome: 'Rio Bom Jardim',
    macrorregiaoId: 'mra-7',
    rioPrincipal: 'Rio Bom Jardim',
    areaKm2: 580,
    populacaoEstimada: 85000,
    nivelRiscoMedio: 'BAIXO',
  },
  {
    id: 'sb-29',
    codigo: 'RJ-29',
    nome: 'Paraíba do Sul - Baixo Curso',
    macrorregiaoId: 'mra-7',
    rioPrincipal: 'Rio Paraíba do Sul',
    areaKm2: 1850,
    populacaoEstimada: 210000,
    nivelRiscoMedio: 'MODERADO',
  },
  {
    id: 'sb-30',
    codigo: 'RJ-30',
    nome: 'Rio Itabapoana - Alto',
    macrorregiaoId: 'mra-7',
    rioPrincipal: 'Rio Itabapoana',
    areaKm2: 980,
    populacaoEstimada: 75000,
    nivelRiscoMedio: 'BAIXO',
  },
];

// ============================================
// Mapeamento de MRA para Sub-bacias
// ============================================

export const SUB_BACIAS_POR_MRA = MACRORREGIOES.map(mra => ({
  ...mra,
  subBacias: SUB_BACIAS.filter(sb => sb.macrorregiaoId === mra.id),
}));

// ============================================
// Dados das Estações de Monitoramento
// ============================================

export const ESTACOES_REAIS = [
  // INMET - Estações Automáticas no RJ
  { codigo: 'A618', nome: 'Rio de Janeiro - Vila Militar', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.8864, longitude: -43.3886, subBaciaId: 'sb-02' },
  { codigo: 'A621', nome: 'Nova Iguaçu', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.7569, longitude: -43.4533, subBaciaId: 'sb-02' },
  { codigo: 'A636', nome: 'Macaé', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.3706, longitude: -41.7889, subBaciaId: 'sb-16' },
  { codigo: 'A602', nome: 'Campos dos Goytacazes', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -21.7536, longitude: -41.3253, subBaciaId: 'sb-12' },
  { codigo: 'A614', nome: 'Resende', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.4689, longitude: -44.4483, subBaciaId: 'sb-20' },
  { codigo: 'A606', nome: 'Cordeiro', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.0283, longitude: -42.3639, subBaciaId: 'sb-24' },
  { codigo: 'A610', nome: 'Petrópolis', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.5058, longitude: -43.1786, subBaciaId: 'sb-04' },
  { codigo: 'A611', nome: 'Teresópolis', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -22.4122, longitude: -42.9656, subBaciaId: 'sb-04' },
  { codigo: 'A620', nome: 'São Fidélis', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -21.6469, longitude: -41.7478, subBaciaId: 'sb-29' },
  { codigo: 'A628', nome: 'Angra dos Reis', fonte: 'INMET', tipo: 'METEOROLOGICO', latitude: -23.0067, longitude: -44.3181, subBaciaId: 'sb-08' },
  
  // CEMADEN - Estações no RJ
  { codigo: 'CEMADEN-RJ-001', nome: 'Rio de Janeiro - Centro', fonte: 'CEMADEN', tipo: 'PLUVIOMETRICO', latitude: -22.9068, longitude: -43.1729, subBaciaId: 'sb-03' },
  { codigo: 'CEMADEN-RJ-002', nome: 'Niterói', fonte: 'CEMADEN', tipo: 'PLUVIOMETRICO', latitude: -22.8858, longitude: -43.1033, subBaciaId: 'sb-04' },
  { codigo: 'CEMADEN-RJ-003', nome: 'São Gonçalo', fonte: 'CEMADEN', tipo: 'PLUVIOMETRICO', latitude: -22.8267, longitude: -43.0636, subBaciaId: 'sb-05' },
  { codigo: 'CEMADEN-RJ-004', nome: 'Duque de Caxias', fonte: 'CEMADEN', tipo: 'FLUVIOMETRICO', latitude: -22.7892, longitude: -43.3114, subBaciaId: 'sb-02' },
  { codigo: 'CEMADEN-RJ-005', nome: 'Petrópolis - Alto', fonte: 'CEMADEN', tipo: 'FLUVIOMETRICO', latitude: -22.4889, longitude: -43.1967, subBaciaId: 'sb-04' },
  { codigo: 'CEMADEN-RJ-006', nome: 'Macaé - Baixo', fonte: 'CEMADEN', tipo: 'FLUVIOMETRICO', latitude: -22.3867, longitude: -41.7533, subBaciaId: 'sb-16' },
  { codigo: 'CEMADEN-RJ-007', nome: 'Campos - Centro', fonte: 'CEMADEN', tipo: 'PLUVIOMETRICO', latitude: -21.7617, longitude: -41.3183, subBaciaId: 'sb-12' },
  { codigo: 'CEMADEN-RJ-008', nome: 'Três Rios', fonte: 'CEMADEN', tipo: 'FLUVIOMETRICO', latitude: -22.1153, longitude: -43.4589, subBaciaId: 'sb-24' },
  
  // INEA - Sistema de Alerta de Cheias
  { codigo: 'INEA-RJ-001', nome: 'Rio Paraíba do Sul - Barra Mansa', fonte: 'INEA', tipo: 'FLUVIOMETRICO', latitude: -22.5456, longitude: -44.1753, subBaciaId: 'sb-20' },
  { codigo: 'INEA-RJ-002', nome: 'Rio Paraíba do Sul - Barra do Piraí', fonte: 'INEA', tipo: 'FLUVIOMETRICO', latitude: -22.4694, longitude: -43.8289, subBaciaId: 'sb-24' },
  { codigo: 'INEA-RJ-003', nome: 'Rio Iguaçu - Belford Roxo', fonte: 'INEA', tipo: 'FLUVIOMETRICO', latitude: -22.7647, longitude: -43.3978, subBaciaId: 'sb-02' },
  { codigo: 'INEA-RJ-004', nome: 'Rio Macacu - Itaboraí', fonte: 'INEA', tipo: 'FLUVIOMETRICO', latitude: -22.7458, longitude: -42.8581, subBaciaId: 'sb-04' },
  { codigo: 'INEA-RJ-005', nome: 'Rio Macaé - Monte Alegre', fonte: 'INEA', tipo: 'FLUVIOMETRICO', latitude: -22.3456, longitude: -42.0528, subBaciaId: 'sb-16' },
  
  // Alerta Rio - Pluviômetros da Capital
  { codigo: 'ALERTA-RIO-001', nome: 'Copacabana', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.9711, longitude: -43.1822, subBaciaId: 'sb-03' },
  { codigo: 'ALERTA-RIO-002', nome: 'Tijuca', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.9292, longitude: -43.2311, subBaciaId: 'sb-03' },
  { codigo: 'ALERTA-RIO-003', nome: 'Jacarepaguá', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.9633, longitude: -43.3467, subBaciaId: 'sb-07' },
  { codigo: 'ALERTA-RIO-004', nome: 'Madureira', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.8753, longitude: -43.3383, subBaciaId: 'sb-03' },
  { codigo: 'ALERTA-RIO-005', nome: 'Ramos', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.8819, longitude: -43.2781, subBaciaId: 'sb-03' },
  { codigo: 'ALERTA-RIO-006', nome: 'Bangu', fonte: 'ALERTA_RIO', tipo: 'PLUVIOMETRICO', latitude: -22.8797, longitude: -43.4658, subBaciaId: 'sb-07' },
  { codigo: 'ALERTA-RIO-RADAR', nome: 'Radar Meteorológico - Sumaré', fonte: 'ALERTA_RIO', tipo: 'RADAR', latitude: -22.9244, longitude: -43.2611, subBaciaId: 'sb-03' },
  
  // CPTEC/INPE - Referências
  { codigo: 'CPTEC-RJ-001', nome: 'Satélite GOES-16 - RJ', fonte: 'CPTEC', tipo: 'METEOROLOGICO', latitude: -22.5, longitude: -43.0, subBaciaId: 'sb-02' },
];

// ============================================
// Configurações de APIs
// ============================================

export const API_CONFIG = {
  INMET: {
    nome: 'INMET - Instituto Nacional de Meteorologia',
    baseUrl: 'https://apitempo.inmet.gov.br',
    endpoints: {
      estacoes: '/estacoes/T',
      dadosEstacao: '/estacao/dados/{codigoEstacao}',
      dadosDiarios: '/estacao/diaria/{dataInicio}/{dataFim}/{codigoEstacao}',
    },
    requerChave: false,
  },
  CEMADEN: {
    nome: 'CEMADEN - Centro Nacional de Monitoramento e Alertas de Desastres Naturais',
    baseUrl: 'https://www.cemaden.gov.br',
    endpoints: {
      mapa: '/mapa-interativo',
      estacoes: '/api/estacoes',
      dados: '/api/dados/{codigoEstacao}',
    },
    requerChave: true,
    chavePlaceholder: 'CHAVE_CEMADEN',
  },
  INEA: {
    nome: 'INEA - Instituto Estadual do Ambiente',
    baseUrl: 'https://www.inea.rj.gov.br',
    endpoints: {
      alertaCheias: '/sistema-alerta-cheias/api',
      estacoes: '/api/estacoes-hidrologicas',
    },
    requerChave: true,
    chavePlaceholder: 'CHAVE_INEA',
  },
  ALERTA_RIO: {
    nome: 'Alerta Rio - Sistema de Alerta de Chuvas da PCRJ',
    baseUrl: 'http://alertario.rio.rj.gov.br',
    endpoints: {
      pluviometros: '/api/pluviometros',
      radar: '/api/radar',
      alertas: '/api/alertas',
    },
    requerChave: true,
    chavePlaceholder: 'CHAVE_ALERTA_RIO',
  },
  CPTEC: {
    nome: 'CPTEC/INPE - Centro de Previsão de Tempo e Estudos Climáticos',
    baseUrl: 'https://api.cptec.inpe.br',
    endpoints: {
      satelite: '/v1/satelite',
      previsao: '/v1/previsao/{cidade}',
      ondas: '/v1/ondas/{cidade}',
    },
    requerChave: false,
  },
};

// ============================================
// Mensagens de Alerta
// ============================================

export const MENSAGENS_ALERTA = {
  ATENCAO: {
    titulo: 'Nível de Atenção',
    cor: 'amber',
    acoes: [
      'Fique atento às informações meteorológicas',
      'Evite áreas de risco',
      'Tenha um plano de emergência preparado',
    ],
  },
  ALERTA: {
    titulo: 'Nível de Alerta',
    cor: 'orange',
    acoes: [
      'Afaste-se de áreas de risco imediatamente',
      'Não cruze vias alagadas',
      'Siga orientações da Defesa Civil',
    ],
  },
  ALERTA_MAXIMO: {
    titulo: 'Alerta Máximo',
    cor: 'red',
    acoes: [
      'EVACUE IMEDIATAMENTE áreas de risco',
      'Procure locais elevados',
      'Ligue 193 ou 199 para emergências',
      'NÃO tente atravessar áreas alagadas',
    ],
  },
};

// ============================================
// Rótulos em Português
// ============================================

export const ROTULOS = {
  niveisAlerta: {
    ATENCAO: 'Atenção',
    ALERTA: 'Alerta',
    ALERTA_MAXIMO: 'Alerta Máximo',
  },
  tiposAlerta: {
    ENCHENTE: 'Enchente',
    ALAGAMENTO: 'Alagamento',
    DESLIZAMENTO: 'Deslizamento',
    SECA: 'Seca',
  },
  niveisRisco: {
    BAIXO: 'Baixo',
    MODERADO: 'Moderado',
    ALTO: 'Alto',
    CRITICO: 'Crítico',
  },
  tipoEstacao: {
    PLUVIOMETRICO: 'Pluviométrico',
    FLUVIOMETRICO: 'Fluviométrico',
    METEOROLOGICO: 'Meteorológico',
    RADAR: 'Radar',
  },
  fonteEstacao: {
    INMET: 'INMET',
    CEMADEN: 'CEMADEN',
    INEA: 'INEA',
    ALERTA_RIO: 'Alerta Rio',
    CPTEC: 'CPTEC/INPE',
  },
};
