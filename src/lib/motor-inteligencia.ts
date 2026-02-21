// SiMoHi-RJ - Motor de Inteligência (Agente de Veracidade)
// Sistema de análise convergente para validação de alertas hidrológicos

import type { Alerta, LeituraSensor, NivelAlerta, TipoAlerta, SubBaciaHidrografica } from '@/lib/types';
import { SUB_BACIAS } from '@/lib/constants';

// ============================================
// Tipos do Motor de Inteligência
// ============================================

interface DadosRadar {
  chuvaEstimada: number; // mm/h
  reflectividade: number; // dBZ
  timestamp: Date;
  fonte: 'ALERTA_RIO' | 'CPTEC';
}

interface DadosSensores {
  nivelRio: number;
  vazao: number;
  chuvaAcumulada: number;
  timestamp: Date;
  fonte: 'INEA' | 'CEMADEN' | 'INMET';
}

interface AnaliseConvergencia {
  convergente: boolean;
  scoreConfianca: number;
  dadosRadar: DadosRadar | null;
  dadosSensores: DadosSensores | null;
  nivelAlertaSugerido: NivelAlerta;
  tipoAlerta: TipoAlerta;
  justificativa: string;
}

interface LogRaciocinioInterno {
  etapa: 'ANALISE' | 'VERIFICACAO' | 'CONVERGENCIA' | 'CONCLUSAO';
  mensagem: string;
  dados?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================
// Constantes de Threshold
// ============================================

const THRESHOLDS = {
  // Chuva (mm/h)
  chuvaLeve: 2.5,
  chuvaModerada: 10,
  chuvaForte: 25,
  chuvaMuitoForte: 50,
  
  // Chuva acumulada 24h (mm)
  chuvaAcumuladaAtencao: 30,
  chuvaAcumuladaAlerta: 50,
  chuvaAcumuladaCritico: 80,
  
  // Nível do rio (varia por bacia - valores padrão)
  nivelAtencao: 2.0,
  nivelAlerta: 2.5,
  nivelCritico: 3.0,
  
  // Reflectividade radar (dBZ)
  reflectividadeLeve: 20,
  reflectividadeModerada: 35,
  reflectividadeForte: 45,
  reflectividadeSevera: 55,
  
  // Score de confiança mínimo para alerta
  scoreMinimoAtencao: 50,
  scoreMinimoAlerta: 70,
  scoreMinimoCritico: 85,
};

// ============================================
// Classe do Motor de Inteligência
// ============================================

export class MotorInteligencia {
  private logs: LogRaciocinioInterno[] = [];
  private onLog?: (log: LogRaciocinioInterno) => void;

  constructor(onLog?: (log: LogRaciocinioInterno) => void) {
    this.onLog = onLog;
  }

  // Adiciona log de raciocínio
  private log(etapa: LogRaciocinioInterno['etapa'], mensagem: string, dados?: Record<string, unknown>) {
    const novoLog: LogRaciocinioInterno = {
      etapa,
      mensagem,
      dados,
      timestamp: new Date(),
    };
    this.logs.push(novoLog);
    this.onLog?.(novoLog);
  }

  // Análise principal de uma sub-bacia
  async analisarSubBacia(
    subBacia: SubBaciaHidrografica,
    dadosRadar: DadosRadar | null,
    dadosSensores: DadosSensores | null
  ): Promise<AnaliseConvergencia> {
    this.log('ANALISE', `Iniciando análise da sub-bacia ${subBacia.nome}...`, {
      subBaciaId: subBacia.id,
      codigo: subBacia.codigo,
    });

    // Verificar dados do radar
    if (dadosRadar) {
      this.log('VERIFICACAO', `Dados do radar recebidos: ${dadosRadar.fonte}`, {
        chuvaEstimada: dadosRadar.chuvaEstimada,
        reflectividade: dadosRadar.reflectividade,
      });
    } else {
      this.log('VERIFICACAO', 'Nenhum dado de radar disponível para esta sub-bacia');
    }

    // Verificar dados dos sensores
    if (dadosSensores) {
      this.log('VERIFICACAO', `Dados dos sensores recebidos: ${dadosSensores.fonte}`, {
        nivelRio: dadosSensores.nivelRio,
        vazao: dadosSensores.vazao,
        chuvaAcumulada: dadosSensores.chuvaAcumulada,
      });
    } else {
      this.log('VERIFICACAO', 'Nenhum dado de sensor disponível para esta sub-bacia');
    }

    // Análise de convergência
    const resultado = this.analisarConvergencia(subBacia, dadosRadar, dadosSensores);

    this.log('CONVERGENCIA', `Análise de convergência concluída`, {
      convergente: resultado.convergente,
      scoreConfianca: resultado.scoreConfianca,
    });

    // Conclusão
    if (resultado.nivelAlertaSugerido) {
      this.log('CONCLUSAO', `ALERTA ${resultado.nivelAlertaSugerido} sugerido para ${subBacia.nome}`, {
        tipo: resultado.tipoAlerta,
        nivel: resultado.nivelAlertaSugerido,
        justificativa: resultado.justificativa,
      });
    } else {
      this.log('CONCLUSAO', `Nenhum alerta necessário para ${subBacia.nome}`);
    }

    return resultado;
  }

  // Análise de convergência entre radar e sensores
  private analisarConvergencia(
    subBacia: SubBaciaHidrografica,
    dadosRadar: DadosRadar | null,
    dadosSensores: DadosSensores | null
  ): AnaliseConvergencia {
    let score = 0;
    let dadosRadarValidos = false;
    let dadosSensoresValidos = false;
    let indicadoresRisco = 0;

    // Análise do Radar
    if (dadosRadar) {
      // Reflectividade indica chuva
      if (dadosRadar.reflectividade >= THRESHOLDS.reflectividadeSevera) {
        score += 30;
        indicadoresRisco += 3;
        dadosRadarValidos = true;
      } else if (dadosRadar.reflectividade >= THRESHOLDS.reflectividadeForte) {
        score += 20;
        indicadoresRisco += 2;
        dadosRadarValidos = true;
      } else if (dadosRadar.reflectividade >= THRESHOLDS.reflectividadeModerada) {
        score += 10;
        indicadoresRisco += 1;
        dadosRadarValidos = true;
      }

      // Chuva estimada pelo radar
      if (dadosRadar.chuvaEstimada >= THRESHOLDS.chuvaMuitoForte) {
        score += 25;
        indicadoresRisco += 2;
      } else if (dadosRadar.chuvaEstimada >= THRESHOLDS.chuvaForte) {
        score += 15;
        indicadoresRisco += 1;
      }
    }

    // Análise dos Sensores
    if (dadosSensores) {
      // Nível do rio
      if (dadosSensores.nivelRio >= THRESHOLDS.nivelCritico) {
        score += 35;
        indicadoresRisco += 3;
        dadosSensoresValidos = true;
      } else if (dadosSensores.nivelRio >= THRESHOLDS.nivelAlerta) {
        score += 25;
        indicadoresRisco += 2;
        dadosSensoresValidos = true;
      } else if (dadosSensores.nivelRio >= THRESHOLDS.nivelAtencao) {
        score += 15;
        indicadoresRisco += 1;
        dadosSensoresValidos = true;
      }

      // Chuva acumulada
      if (dadosSensores.chuvaAcumulada >= THRESHOLDS.chuvaAcumuladaCritico) {
        score += 20;
        indicadoresRisco += 2;
      } else if (dadosSensores.chuvaAcumulada >= THRESHOLDS.chuvaAcumuladaAlerta) {
        score += 15;
        indicadoresRisco += 1;
      } else if (dadosSensores.chuvaAcumulada >= THRESHOLDS.chuvaAcumuladaAtencao) {
        score += 10;
      }
    }

    // Bônus de convergência (ambos os dados indicam risco)
    const convergente = dadosRadarValidos && dadosSensoresValidos && indicadoresRisco >= 4;
    if (convergente) {
      score += 20; // Bônus significativo para convergência
    }

    // Limitar score a 100
    score = Math.min(100, score);

    // Determinar nível de alerta
    let nivelAlertaSugerido: NivelAlerta | null = null;
    let tipoAlerta: TipoAlerta = 'ENCHENTE';
    let justificativa = '';

    if (score >= THRESHOLDS.scoreMinimoCritico && convergente) {
      nivelAlertaSugerido = 'ALERTA_MAXIMO';
      justificativa = 'Convergência crítica entre radar e sensores. Evacuação imediata recomendada.';
      tipoAlerta = this.determinarTipoAlerta(dadosRadar, dadosSensores);
    } else if (score >= THRESHOLDS.scoreMinimoAlerta) {
      nivelAlertaSugerido = 'ALERTA';
      justificativa = 'Indicadores elevados detectados. Monitoramento intensivo necessário.';
      tipoAlerta = this.determinarTipoAlerta(dadosRadar, dadosSensores);
    } else if (score >= THRESHOLDS.scoreMinimoAtencao) {
      nivelAlertaSugerido = 'ATENCAO';
      justificativa = 'Condições de atenção. Acompanhar evolução.';
      tipoAlerta = this.determinarTipoAlerta(dadosRadar, dadosSensores);
    }

    return {
      convergente,
      scoreConfianca: score,
      dadosRadar,
      dadosSensores,
      nivelAlertaSugerido: nivelAlertaSugerido!,
      tipoAlerta,
      justificativa,
    };
  }

  // Determinar tipo de alerta baseado nos dados
  private determinarTipoAlerta(
    dadosRadar: DadosRadar | null,
    dadosSensores: DadosSensores | null
  ): TipoAlerta {
    // Se nível do rio muito alto e chuva forte = enchente
    if (dadosSensores?.nivelRio && dadosSensores.nivelRio >= THRESHOLDS.nivelAlerta) {
      return 'ENCHENTE';
    }
    
    // Se muita chuva mas rio não subiu tanto = alagamento
    if (dadosSensores?.chuvaAcumulada && dadosSensores.chuvaAcumulada >= THRESHOLDS.chuvaAcumuladaAlerta) {
      if (!dadosSensores.nivelRio || dadosSensores.nivelRio < THRESHOLDS.nivelAlerta) {
        return 'ALAGAMENTO';
      }
    }

    // Default
    return 'ENCHENTE';
  }

  // Gerar alerta a partir da análise
  gerarAlerta(
    subBacia: SubBaciaHidrografica,
    analise: AnaliseConvergencia
  ): Alerta | null {
    if (!analise.nivelAlertaSugerido) {
      return null;
    }

    const alerta: Alerta = {
      id: `alerta-${Date.now()}-${subBacia.id}`,
      subBaciaId: subBacia.id,
      tipo: analise.tipoAlerta,
      nivel: analise.nivelAlertaSugerido,
      titulo: this.gerarTituloAlerta(analise.tipoAlerta, subBacia),
      descricao: this.gerarDescricaoAlerta(analise),
      recomendacoes: this.gerarRecomendacoes(analise.nivelAlertaSugerido),
      scoreConfianca: analise.scoreConfianca,
      dadosRadar: analise.dadosRadar !== null,
      dadosSensores: analise.dadosSensores !== null,
      convergencia: analise.convergente,
      fontesConfirmadas: this.obterFontesConfirmadas(analise),
      ativo: true,
      inicio: new Date(),
    };

    return alerta;
  }

  // Geradores de texto
  private gerarTituloAlerta(tipo: TipoAlerta, subBacia: SubBaciaHidrografica): string {
    const titulos: Record<TipoAlerta, string> = {
      ENCHENTE: `Risco de Enchente - ${subBacia.rioPrincipal || subBacia.nome}`,
      ALAGAMENTO: `Risco de Alagamento - ${subBacia.nome}`,
      DESLIZAMENTO: `Risco de Deslizamento - ${subBacia.nome}`,
      SECA: `Alerta de Seca - ${subBacia.nome}`,
    };
    return titulos[tipo];
  }

  private gerarDescricaoAlerta(analise: AnaliseConvergencia): string {
    const partes: string[] = [];

    if (analise.dadosRadar) {
      partes.push(`Radar: chuva estimada de ${analise.dadosRadar.chuvaEstimada}mm/h`);
    }
    if (analise.dadosSensores) {
      partes.push(`Nível do rio: ${analise.dadosSensores.nivelRio}m`);
      partes.push(`Chuva acumulada 24h: ${analise.dadosSensores.chuvaAcumulada}mm`);
    }
    if (analise.convergente) {
      partes.push('CONVERGÊNCIA CONFIRMADA entre fontes');
    }

    return partes.join('. ') + '.';
  }

  private gerarRecomendacoes(nivel: NivelAlerta): string {
    const recomendacoes: Record<NivelAlerta, string> = {
      ATENCAO: 'Mantenha-se informado. Evite áreas de risco. Tenha plano de emergência preparado.',
      ALERTA: 'Afaste-se de áreas de risco. Não cruze vias alagadas. Siga orientações da Defesa Civil.',
      ALERTA_MAXIMO: 'EVACUE IMEDIATAMENTE áreas de risco. Procure locais elevados. Ligue 193/199. NÃO atravesse áreas alagadas.',
    };
    return recomendacoes[nivel];
  }

  private obterFontesConfirmadas(analise: AnaliseConvergencia): string[] {
    const fontes: string[] = [];
    if (analise.dadosRadar) {
      fontes.push(analise.dadosRadar.fonte);
    }
    if (analise.dadosSensores) {
      fontes.push(analise.dadosSensores.fonte);
    }
    return fontes;
  }

  // Obter logs
  getLogs(): LogRaciocinioInterno[] {
    return [...this.logs];
  }

  // Limpar logs
  limparLogs(): void {
    this.logs = [];
  }
}

// ============================================
// Funções Utilitárias
// ============================================

// Simular dados de radar para demonstração
export function simularDadosRadar(): DadosRadar {
  const chuvas = [0, 5, 15, 30, 50, 80];
  const chuvaEstimada = chuvas[Math.floor(Math.random() * chuvas.length)];
  
  let reflectividade = 15;
  if (chuvaEstimada > 50) reflectividade = 55 + Math.random() * 10;
  else if (chuvaEstimada > 25) reflectividade = 45 + Math.random() * 10;
  else if (chuvaEstimada > 10) reflectividade = 35 + Math.random() * 10;
  else if (chuvaEstimada > 2) reflectividade = 25 + Math.random() * 10;

  return {
    chuvaEstimada,
    reflectividade,
    timestamp: new Date(),
    fonte: Math.random() > 0.5 ? 'ALERTA_RIO' : 'CPTEC',
  };
}

// Simular dados de sensores para demonstração
export function simularDadosSensores(): DadosSensores {
  const niveis = [1.2, 1.5, 1.8, 2.2, 2.8, 3.5];
  const nivelRio = niveis[Math.floor(Math.random() * niveis.length)];
  
  const chuvas = [0, 10, 25, 40, 60, 90];
  const chuvaAcumulada = chuvas[Math.floor(Math.random() * chuvas.length)];

  const fontes: DadosSensores['fonte'][] = ['INEA', 'CEMADEN', 'INMET'];

  return {
    nivelRio,
    vazao: 30 + nivelRio * 20 + Math.random() * 10,
    chuvaAcumulada,
    timestamp: new Date(),
    fonte: fontes[Math.floor(Math.random() * fontes.length)],
  };
}

// Instância singleton do motor
let motorInstance: MotorInteligencia | null = null;

export function getMotorInteligencia(onLog?: (log: LogRaciocinioInterno) => void): MotorInteligencia {
  if (!motorInstance) {
    motorInstance = new MotorInteligencia(onLog);
  }
  return motorInstance;
}
