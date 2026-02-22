import { NextResponse } from 'next/server';
import { ESTACOES_REAIS } from '@/lib/constants';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const PARAMS = 'current=temperature_2m,precipitation,windspeed_10m,relativehumidity_2m,weathercode,apparent_temperature&timezone=America/Sao_Paulo';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estacaoId = searchParams.get('estacao');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  try {
    // Busca por coordenadas diretas (modo cidadão)
    if (lat && lng) {
      const dados = await fetchOpenMeteo(parseFloat(lat), parseFloat(lng));
      return NextResponse.json({ sucesso: true, dados });
    }

    // Busca por estação específica
    if (estacaoId) {
      const estacao = ESTACOES_REAIS.find(e => e.codigo === estacaoId);
      if (!estacao) return NextResponse.json({ erro: 'Estação não encontrada' }, { status: 404 });
      const dados = await fetchOpenMeteo(estacao.latitude, estacao.longitude);
      return NextResponse.json({ sucesso: true, estacao: estacao.nome, dados });
    }

    // Busca todas as estações INMET (meteorológicas)
    const estacoesMet = ESTACOES_REAIS.filter(e => e.tipo === 'METEOROLOGICO');
    const resultados = await Promise.all(
      estacoesMet.map(async estacao => {
        const dados = await fetchOpenMeteo(estacao.latitude, estacao.longitude);
        return { estacao: estacao.nome, codigo: estacao.codigo, subBaciaId: estacao.subBaciaId, dados };
      })
    );

    return NextResponse.json({ sucesso: true, total: resultados.length, dados: resultados });

  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao buscar dados', detalhes: String(error) }, { status: 500 });
  }
}

async function fetchOpenMeteo(lat: number, lng: number) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lng}&${PARAMS}`;
  const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const json = await res.json();
  return {
    temperatura: json.current.temperature_2m,
    sensacaoTermica: json.current.apparent_temperature,
    chuva: json.current.precipitation,
    vento: json.current.windspeed_10m,
    umidade: json.current.relativehumidity_2m,
    codigoTempo: json.current.weathercode,
    timestamp: json.current.time,
    latitude: json.latitude,
    longitude: json.longitude,
  };
}