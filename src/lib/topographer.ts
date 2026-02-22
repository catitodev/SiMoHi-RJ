import { SUB_BACIAS, MACRORREGIOES } from './constants';

// Calcula distância entre dois pontos (graus → km aproximado)
function distancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dlat = lat1 - lat2;
  const dlng = lng1 - lng2;
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

// Centroides aproximados das sub-bacias
const CENTROIDES: Record<string, { lat: number; lng: number }> = {
  'sb-01': { lat: -22.75, lng: -43.55 },
  'sb-02': { lat: -22.80, lng: -43.45 },
  'sb-03': { lat: -22.87, lng: -43.35 },
  'sb-04': { lat: -22.65, lng: -42.95 },
  'sb-05': { lat: -22.75, lng: -42.85 },
  'sb-06': { lat: -22.65, lng: -43.10 },
  'sb-07': { lat: -22.85, lng: -43.65 },
  'sb-08': { lat: -22.70, lng: -43.90 },
  'sb-09': { lat: -22.90, lng: -42.80 },
  'sb-10': { lat: -21.95, lng: -41.90 },
  'sb-11': { lat: -22.50, lng: -42.20 },
  'sb-12': { lat: -21.75, lng: -41.33 },
  'sb-13': { lat: -22.40, lng: -43.10 },
  'sb-14': { lat: -22.20, lng: -43.70 },
  'sb-15': { lat: -22.55, lng: -42.60 },
  'sb-16': { lat: -22.37, lng: -41.78 },
  'sb-17': { lat: -22.52, lng: -41.95 },
  'sb-18': { lat: -22.60, lng: -42.05 },
  'sb-19': { lat: -22.85, lng: -42.20 },
  'sb-20': { lat: -22.50, lng: -44.20 },
  'sb-21': { lat: -22.35, lng: -43.80 },
  'sb-22': { lat: -21.90, lng: -43.10 },
  'sb-23': { lat: -21.60, lng: -42.35 },
  'sb-24': { lat: -22.30, lng: -43.55 },
  'sb-25': { lat: -21.75, lng: -42.60 },
  'sb-26': { lat: -20.95, lng: -42.05 },
  'sb-27': { lat: -21.20, lng: -41.90 },
  'sb-28': { lat: -21.95, lng: -42.40 },
  'sb-29': { lat: -21.65, lng: -41.55 },
  'sb-30': { lat: -21.10, lng: -41.45 },
};

export interface LocalizacaoHidrografica {
  hiperlocal: { lat: number; lng: number; label: string };
  subBacia: { id: string; nome: string; codigo: string; nivelRisco: string };
  mra: { id: string; nome: string; codigo: string };
}

export function identificarLocalizacao(lat: number, lng: number): LocalizacaoHidrografica {
  // Encontra sub-bacia mais próxima
  let menorDist = Infinity;
  let subBaciaId = 'sb-01';

  for (const [id, centro] of Object.entries(CENTROIDES)) {
    const d = distancia(lat, lng, centro.lat, centro.lng);
    if (d < menorDist) {
      menorDist = d;
      subBaciaId = id;
    }
  }

  const subBacia = SUB_BACIAS.find(sb => sb.id === subBaciaId)!;
  const mra = MACRORREGIOES.find(m => m.id === subBacia.macrorregiaoId)!;

  return {
    hiperlocal: {
      lat,
      lng,
      label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    },
    subBacia: {
      id: subBacia.id,
      nome: subBacia.nome,
      codigo: subBacia.codigo,
      nivelRisco: subBacia.nivelRiscoMedio || 'BAIXO',
    },
    mra: {
      id: mra.id,
      nome: mra.nome,
      codigo: mra.codigo,
    },
  };
}