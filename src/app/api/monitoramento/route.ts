// SiMoHi-RJ - API de Monitoramento Hidrológico
// Endpoints para dados de estações, alertas e análise

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMotorInteligencia, simularDadosRadar, simularDadosSensores } from '@/lib/motor-inteligencia';
import { SUB_BACIAS, MACRORREGIOES, ESTACOES_REAIS } from '@/lib/constants';
import type { Alerta, SubBaciaHidrografica } from '@/lib/types';

// ============================================
// GET /api/monitoramento
// Retorna dados consolidados do monitoramento
// ============================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const acao = searchParams.get('acao') || 'status';
  const subBaciaId = searchParams.get('subBaciaId');
  const mraId = searchParams.get('mraId');

  try {
    switch (acao) {
      case 'status':
        return getStatusGeral();
      
      case 'alertas':
        return getAlertasAtivos();
      
      case 'subbacias':
        return getSubBacias(mraId);
      
      case 'estacoes':
        return getEstacoes(subBaciaId);
      
      case 'leituras':
        return getLeituras(subBaciaId);
      
      case 'analise':
        return executarAnalise(subBaciaId);
      
      case 'mras':
        return getMacrorregioes();
      
      default:
        return NextResponse.json(
          { erro: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de monitoramento:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor', detalhes: String(error) },
      { status: 500 }
    );
  }
}

// ============================================
// Funções de Resposta
// ============================================

async function getStatusGeral() {
  const alertasAtivos = await db.alerta.count({ where: { ativo: true } });
  const alertasCriticos = await db.alerta.count({ 
    where: { ativo: true, nivel: 'ALERTA_MAXIMO' } 
  });
  
  return NextResponse.json({
    sucesso: true,
    dados: {
      timestamp: new Date().toISOString(),
      alertasAtivos,
      alertasCriticos,
      estacoesAtivas: 47,
      estacoesTotal: 52,
      mras: MACRORREGIOES.length,
      subBacias: SUB_BACIAS.length,
      apis: {
        INMET: { status: 'OPERACIONAL', latencia: 120 },
        CEMADEN: { status: 'OPERACIONAL', latencia: 350 },
        INEA: { status: 'DEGRADADO', latencia: 890 },
        ALERTA_RIO: { status: 'OPERACIONAL', latencia: 80 },
        CPTEC: { status: 'OPERACIONAL', latencia: 200 },
      },
    },
  });
}

async function getAlertasAtivos() {
  const alertas = await db.alerta.findMany({
    where: { ativo: true },
    include: { subBacia: true },
    orderBy: [
      { nivel: 'desc' },
      { inicio: 'desc' }
    ],
    take: 20,
  });

  if (alertas.length === 0) {
    return NextResponse.json({
      sucesso: true,
      dados: gerarAlertasSimulados(),
    });
  }

  return NextResponse.json({
    sucesso: true,
    dados: alertas,
  });
}

async function getSubBacias(mraId: string | null) {
  let subBacias = SUB_BACIAS;
  
  if (mraId) {
    subBacias = SUB_BACIAS.filter(sb => sb.macrorregiaoId === mraId);
  }

  return NextResponse.json({
    sucesso: true,
    dados: subBacias,
    total: subBacias.length,
  });
}

async function getEstacoes(subBaciaId: string | null) {
  let estacoes = ESTACOES_REAIS;
  
  if (subBaciaId) {
    estacoes = ESTACOES_REAIS.filter(e => e.subBaciaId === subBaciaId);
  }

  const estacoesComStatus = estacoes.map(e => ({
    ...e,
    ativa: Math.random() > 0.1,
    ultimaLeitura: new Date(Date.now() - Math.random() * 3600000),
  }));

  return NextResponse.json({
    sucesso: true,
    dados: estacoesComStatus,
    total: estacoesComStatus.length,
  });
}

async function getLeituras(subBaciaId: string | null) {
  const leituras: unknown[] = [];
  const now = new Date();
  
  const estacoes = subBaciaId 
    ? ESTACOES_REAIS.filter(e => e.subBaciaId === subBaciaId)
    : ESTACOES_REAIS.slice(0, 10);

  for (const estacao of estacoes) {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      leituras.push({
        estacaoId: estacao.codigo,
        estacaoNome: estacao.nome,
        timestamp: timestamp.toISOString(),
        chuvaAtual: Math.random() * 10,
        chuvaAcumulada1h: Math.random() * 15,
        chuvaAcumulada24h: Math.random() * 60,
        nivelRio: estacao.tipo === 'FLUVIOMETRICO' ? 1.5 + Math.random() * 2 : null,
        temperatura: 20 + Math.random() * 10,
        umidade: 60 + Math.random() * 35,
        fonte: estacao.fonte,
      });
    }
  }

  return NextResponse.json({
    sucesso: true,
    dados: leituras.slice(0, 100),
  });
}

async function executarAnalise(subBaciaId: string | null) {
  if (!subBaciaId) {
    return NextResponse.json(
      { erro: 'subBaciaId é obrigatório para análise' },
      { status: 400 }
    );
  }

  const subBacia = SUB_BACIAS.find(sb => sb.id === subBaciaId);
  if (!subBacia) {
    return NextResponse.json(
      { erro: 'Sub-bacia não encontrada' },
      { status: 404 }
    );
  }

  const dadosRadar = simularDadosRadar();
  const dadosSensores = simularDadosSensores();

  const motor = getMotorInteligencia();
  const analise = await motor.analisarSubBacia(
    subBacia as SubBaciaHidrografica,
    dadosRadar,
    dadosSensores
  );

  const alerta = motor.gerarAlerta(subBacia as SubBaciaHidrografica, analise);

  if (alerta) {
    try {
      await db.alerta.create({
        data: {
          id: alerta.id,
          subBaciaId: alerta.subBaciaId,
          tipo: alerta.tipo,
          nivel: alerta.nivel,
          titulo: alerta.titulo,
          descricao: alerta.descricao,
          recomendacoes: alerta.recomendacoes,
          scoreConfianca: alerta.scoreConfianca,
          dadosRadar: alerta.dadosRadar,
          dadosSensores: alerta.dadosSensores,
          convergencia: alerta.convergencia,
          fontesConfirmadas: JSON.stringify(alerta.fontesConfirmadas),
          ativo: alerta.ativo,
          inicio: alerta.inicio,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar alerta:', error);
    }
  }

  return NextResponse.json({
    sucesso: true,
    dados: {
      subBacia,
      analise,
      alerta,
      logs: motor.getLogs().slice(-10),
    },
  });
}

async function getMacrorregioes() {
  const mrasComBacias = MACRORREGIOES.map(mra => ({
    ...mra,
    subBacias: SUB_BACIAS.filter(sb => sb.macrorregiaoId === mra.id),
    alertasAtivos: Math.floor(Math.random() * 3),
  }));

  return NextResponse.json({
    sucesso: true,
    dados: mrasComBacias,
  });
}

// ============================================
// POST /api/monitoramento
// ============================================

export async function POST(request: Request) {
  const body = await request.json();
  const { acao, dados } = body;

  try {
    switch (acao) {
      case 'criar_alerta':
        return criarAlerta(dados);
      
      case 'atualizar_leitura':
        return atualizarLeitura(dados);
      
      case 'encerrar_alerta':
        return encerrarAlerta(dados.alertaId);
      
      default:
        return NextResponse.json(
          { erro: 'Ação não reconhecida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erro na API de monitoramento:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function criarAlerta(dados: Partial<Alerta>) {
  const alerta = await db.alerta.create({
    data: {
      subBaciaId: dados.subBaciaId || 'sb-02',
      tipo: dados.tipo || 'ENCHENTE',
      nivel: dados.nivel || 'ATENCAO',
      titulo: dados.titulo || 'Alerta de teste',
      descricao: dados.descricao || '',
      recomendacoes: dados.recomendacoes || '',
      scoreConfianca: dados.scoreConfianca || 50,
      dadosRadar: dados.dadosRadar || false,
      dadosSensores: dados.dadosSensores || false,
      convergencia: dados.convergencia || false,
      fontesConfirmadas: JSON.stringify(dados.fontesConfirmadas || []),
      ativo: true,
      inicio: new Date(),
    },
  });

  return NextResponse.json({
    sucesso: true,
    dados: alerta,
  });
}

async function atualizarLeitura(dados: Record<string, unknown>) {
  const leitura = await db.leituraSensor.create({
    data: {
      estacaoId: dados.estacaoId as string,
      timestamp: new Date(),
      chuvaAtual: dados.chuvaAtual as number | null,
      chuvaAcumulada1h: dados.chuvaAcumulada1h as number | null,
      chuvaAcumulada24h: dados.chuvaAcumulada24h as number | null,
      nivelRio: dados.nivelRio as number | null,
      vazao: dados.vazao as number | null,
      temperatura: dados.temperatura as number | null,
      umidade: dados.umidade as number | null,
      fonte: (dados.fonte as string) || 'MANUAL',
    },
  });

  return NextResponse.json({
    sucesso: true,
    dados: leitura,
  });
}

async function encerrarAlerta(alertaId: string) {
  const alerta = await db.alerta.update({
    where: { id: alertaId },
    data: {
      ativo: false,
      fim: new Date(),
    },
  });

  return NextResponse.json({
    sucesso: true,
    dados: alerta,
  });
}

// ============================================
// Funções Auxiliares
// ============================================

function gerarAlertasSimulados(): Alerta[] {
  return [
    {
      id: 'alerta-sim-001',
      subBaciaId: 'sb-02',
      tipo: 'ENCHENTE',
      nivel: 'ALERTA_MAXIMO',
      titulo: 'Enchente Iminente - Rio Iguaçu',
      descricao: 'Nível crítico atingido. Chuva intensa nas últimas 6 horas.',
      recomendacoes: 'EVACUE IMEDIATAMENTE áreas de risco. Ligue 193.',
      scoreConfianca: 94,
      dadosRadar: true,
      dadosSensores: true,
      convergencia: true,
      fontesConfirmadas: ['ALERTA_RIO', 'INEA', 'CEMADEN'],
      ativo: true,
      inicio: new Date(Date.now() - 1800000),
    },
    {
      id: 'alerta-sim-002',
      subBaciaId: 'sb-04',
      tipo: 'ALAGAMENTO',
      nivel: 'ALERTA',
      titulo: 'Risco de Alagamento - Rio Macacu',
      descricao: 'Chuva intensa. Nível do rio subindo rapidamente.',
      recomendacoes: 'Evite áreas baixas. Não cruze vias alagadas.',
      scoreConfianca: 78,
      dadosRadar: true,
      dadosSensores: true,
      convergencia: false,
      fontesConfirmadas: ['ALERTA_RIO', 'INMET'],
      ativo: true,
      inicio: new Date(Date.now() - 3600000),
    },
    {
      id: 'alerta-sim-003',
      subBaciaId: 'sb-16',
      tipo: 'ENCHENTE',
      nivel: 'ATENCAO',
      titulo: 'Nível Elevado - Rio Macaé',
      descricao: 'Nível do rio acima da média. Monitoramento intensificado.',
      recomendacoes: 'Acompanhe boletins. Tenha plano de emergência.',
      scoreConfianca: 65,
      dadosRadar: false,
      dadosSensores: true,
      convergencia: false,
      fontesConfirmadas: ['CEMADEN'],
      ativo: true,
      inicio: new Date(Date.now() - 7200000),
    },
  ];
}
